import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Calendar, Check, Clock, LogIn, Plus, Send, Trash2, UserCheck, UserPlus, Users, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger } from '../../shared/ui'
import { useTranslation } from '../../lib/i18n'
import { useAuthStore } from '../../store/auth'
import { useFriendsStore } from '../../store/friends'
import { searchUsersApi, type SearchUserResult } from '../../services/api/friendsService'
import type { TaskPriority } from '../../data'
import './FriendsModal.css'

export const FriendsModal = () => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const isModalOpen = useFriendsStore((state) => state.isModalOpen)
  const closeModal = useFriendsStore((state) => state.closeModal)
  const activeTab = useFriendsStore((state) => state.activeTab)
  const setActiveTab = useFriendsStore((state) => state.setActiveTab)
  const friends = useFriendsStore((state) => state.friends)
  const incoming = useFriendsStore((state) => state.incoming)
  const outgoing = useFriendsStore((state) => state.outgoing)
  const sentTasks = useFriendsStore((state) => state.sentTasks)
  const sendRequest = useFriendsStore((state) => state.sendRequest)
  const acceptRequest = useFriendsStore((state) => state.acceptRequest)
  const declineRequest = useFriendsStore((state) => state.declineRequest)
  const removeFriend = useFriendsStore((state) => state.removeFriend)
  const assignTask = useFriendsStore((state) => state.assignTask)

  const [isSimpleMode, setIsSimpleMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [assigningToFriend, setAssigningToFriend] = useState<{ id: string; email: string } | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return
    setIsSearching(true)
    try {
      const results = await searchUsersApi(searchQuery.trim())
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (emailOrId: string) => {
    const res = await sendRequest(emailOrId)
    if (res.success) {
      showFeedback('success', t('friends.action.sent'))
      if (searchQuery.trim()) void handleSearch()
    } else {
      showFeedback('error', res.message || 'Error')
    }
  }

  const handleAccept = async (friendshipId: string) => {
    const success = await acceptRequest(friendshipId)
    if (success) {
      showFeedback('success', t('friends.action.alreadyFriend'))
    }
  }

  const handleDecline = async (friendshipId: string) => {
    const success = await declineRequest(friendshipId)
    if (success) {
      showFeedback('success', t('friends.action.decline'))
    }
  }

  const handleRemove = async (friendId: string) => {
    if (window.confirm(t('friends.action.removeConfirm'))) {
      const success = await removeFriend(friendId)
      if (success) {
        showFeedback('success', t('friends.action.remove'))
      }
    }
  }

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningToFriend || !taskTitle.trim()) return
    setIsSubmittingTask(true)

    const res = await assignTask({
      friendId: assigningToFriend.id,
      title: taskTitle.trim(),
      date: taskDate || undefined,
      priority: taskPriority,
    })

    setIsSubmittingTask(false)
    if (res.success) {
      showFeedback('success', t('friends.task.sentSuccess', undefined, { friend: assigningToFriend.email }))
      setTaskTitle('')
      setTaskDate('')
      setAssigningToFriend(null)
      if (!isSimpleMode) setActiveTab('sent')
    } else {
      showFeedback('error', res.message === 'FRIEND_TASKS_DISABLED' ? t('friends.tasksDisabledForFriend') : res.message || 'Error')
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="friends-modal-content" showCloseButton={false}>
        <div className="friends-modal-header">
          <div className="friends-modal-title-row">
            <Users size={20} color="var(--accent)" />
            <DialogTitle>{t('friends.title')}</DialogTitle>
            {friends.length > 0 && <span className="friends-badge">{friends.length}</span>}
            {incoming.length > 0 && <span className="friends-badge friends-badge--coral">+{incoming.length}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="icon-button"
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)' }}
              title={isSimpleMode ? t('settings.viewMode.normal') : t('settings.viewMode.simple')}
            >
              {isSimpleMode ? 'Normal' : 'Simple'}
            </button>
            <button type="button" className="icon-button" onClick={closeModal} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="friends-modal-body">
            <div className="friends-empty-box">
              <AlertCircle size={36} color="var(--coral)" />
              <p>{t('friends.loginPrompt')}</p>
              <Link to="/auth" onClick={closeModal} className="add-button" style={{ textDecoration: 'none' }}>
                <LogIn size={15} />
                <span>{t('friends.loginBtn')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {!isSimpleMode && (
              <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
                <TabsList className="friends-tabs" aria-label={t('friends.title')}>
                  <TabsTrigger value="friends" className={`friends-tab-btn ${activeTab === 'friends' ? 'is-active' : ''}`}>
                    <Users size={14} />
                    <span>{t('friends.tab.friends')}</span>
                    {friends.length > 0 && <span>({friends.length})</span>}
                  </TabsTrigger>
                  <TabsTrigger value="search" className={`friends-tab-btn ${activeTab === 'search' ? 'is-active' : ''}`}>
                    <UserPlus size={14} />
                    <span>{t('friends.tab.search')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="requests" className={`friends-tab-btn ${activeTab === 'requests' ? 'is-active' : ''}`}>
                    <Clock size={14} />
                    <span>{t('friends.tab.requests')}</span>
                    {incoming.length > 0 && <span className="friends-badge friends-badge--coral">{incoming.length}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className={`friends-tab-btn ${activeTab === 'sent' ? 'is-active' : ''}`}>
                    <Send size={14} />
                    <span>{t('friends.tab.sent')}</span>
                    {sentTasks.length > 0 && <span>({sentTasks.length})</span>}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="friends-modal-body">
              {feedback && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '0.85rem',
                    background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: feedback.type === 'success' ? '#16a34a' : 'var(--coral)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {incoming.length > 0 && (isSimpleMode || activeTab === 'requests') && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', color: 'var(--coral)' }}>
                    {t('friends.incoming.title')} ({incoming.length})
                  </h4>
                  <ul className="friends-list">
                    {incoming.map((req) => (
                      <li key={req.friendshipId} className="friends-card">
                        <div className="friends-card-info">
                          <div className="friends-avatar">
                            <Clock size={16} />
                          </div>
                          <div className="friends-card-text">
                            <span className="friends-card-email">{req.email}</span>
                            <span className="friends-card-status">{t('friends.action.incoming')}</span>
                          </div>
                        </div>
                        <div className="friends-card-actions">
                          <button
                            type="button"
                            className="add-button"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleAccept(req.friendshipId)}
                          >
                            <Check size={13} /> {t('friends.action.accept')}
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            style={{ color: 'var(--coral)' }}
                            onClick={() => handleDecline(req.friendshipId)}
                            title={t('friends.action.decline')}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isSimpleMode ? (
                <div>
                  <form className="friends-search-bar" onSubmit={handleSearch}>
                    <input
                      type="email"
                      className="friends-search-input"
                      placeholder={t('friends.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="add-button"
                      disabled={!searchQuery.trim() || isSearching}
                      onClick={() => handleSendRequest(searchQuery.trim())}
                    >
                      <Plus size={15} />
                      <span>{t('friends.action.add')}</span>
                    </button>
                  </form>

                  {friends.length === 0 ? (
                    <div className="friends-empty-box">
                      <Users size={32} />
                      <p>{t('friends.empty')}</p>
                    </div>
                  ) : (
                    <ul className="friends-list">
                      {friends.map((friend) => (
                        <li key={friend.id} className="friends-card">
                          <div className="friends-card-info">
                            <div className="friends-avatar">
                              <UserCheck size={16} />
                            </div>
                            <div className="friends-card-text">
                              <span className="friends-card-email">{friend.email}</span>
                              <span className="friends-card-status">
                                {friend.allowFriendTasks ? t('friends.status.canReceiveTasks') : t('friends.status.tasksDisabled')}
                              </span>
                            </div>
                          </div>
                          <div className="friends-card-actions">
                            <button
                              type="button"
                              className="add-button"
                              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                              onClick={() =>
                                setAssigningToFriend(assigningToFriend?.id === friend.id ? null : { id: friend.id, email: friend.email })
                              }
                            >
                              <Send size={12} />
                              <span>{t('friends.action.assignTask')}</span>
                            </button>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => handleRemove(friend.id)}
                              title={t('friends.action.remove')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  {activeTab === 'friends' && (
                    <div>
                      {friends.length === 0 ? (
                        <div className="friends-empty-box">
                          <Users size={32} />
                          <p>{t('friends.empty')}</p>
                          <button type="button" className="add-button" onClick={() => setActiveTab('search')}>
                            <UserPlus size={14} /> {t('friends.tab.search')}
                          </button>
                        </div>
                      ) : (
                        <ul className="friends-list">
                          {friends.map((friend) => (
                            <li key={friend.id} className="friends-card">
                              <div className="friends-card-info">
                                <div className="friends-avatar">
                                  <UserCheck size={16} />
                                </div>
                                <div className="friends-card-text">
                                  <span className="friends-card-email">{friend.email}</span>
                                  <span className="friends-card-status">
                                    {friend.allowFriendTasks ? t('friends.status.canReceiveTasks') : t('friends.status.tasksDisabled')}
                                  </span>
                                </div>
                              </div>
                              <div className="friends-card-actions">
                                <button
                                  type="button"
                                  className="add-button"
                                  style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                  onClick={() =>
                                    setAssigningToFriend(
                                      assigningToFriend?.id === friend.id ? null : { id: friend.id, email: friend.email },
                                    )
                                  }
                                >
                                  <Send size={12} />
                                  <span>{t('friends.action.assignTask')}</span>
                                </button>
                                <button
                                  type="button"
                                  className="icon-button"
                                  onClick={() => handleRemove(friend.id)}
                                  title={t('friends.action.remove')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeTab === 'search' && (
                    <div>
                      <form className="friends-search-bar" onSubmit={handleSearch}>
                        <input
                          type="text"
                          className="friends-search-input"
                          placeholder={t('friends.search.placeholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="add-button" disabled={isSearching || !searchQuery.trim()}>
                          {t('friends.search.btn')}
                        </button>
                      </form>

                      {searchResults.length > 0 && (
                        <ul className="friends-list">
                          {searchResults.map((sr) => (
                            <li key={sr.id} className="friends-card">
                              <div className="friends-card-info">
                                <div className="friends-avatar">
                                  <Users size={16} />
                                </div>
                                <span className="friends-card-email">{sr.email}</span>
                              </div>
                              <div className="friends-card-actions">
                                {sr.relationship === 'friend' && (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t('friends.action.alreadyFriend')}</span>
                                )}
                                {sr.relationship === 'outgoing' && (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t('friends.action.sent')}</span>
                                )}
                                {sr.relationship === 'incoming' && sr.friendshipId && (
                                  <button
                                    type="button"
                                    className="add-button"
                                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                    onClick={() => handleAccept(sr.friendshipId!)}
                                  >
                                    <Check size={12} /> {t('friends.action.accept')}
                                  </button>
                                )}
                                {sr.relationship === 'none' && (
                                  <button
                                    type="button"
                                    className="add-button"
                                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                    onClick={() => handleSendRequest(sr.email)}
                                  >
                                    <Plus size={12} /> {t('friends.action.add')}
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeTab === 'requests' && (
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem' }}>{t('friends.outgoing.title')}</h4>
                      {outgoing.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{t('friends.outgoing.empty')}</p>
                      ) : (
                        <ul className="friends-list">
                          {outgoing.map((req) => (
                            <li key={req.friendshipId} className="friends-card">
                              <div className="friends-card-info">
                                <span className="friends-card-email">{req.email}</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t('friends.action.sent')}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeTab === 'sent' && (
                    <div>
                      {sentTasks.length === 0 ? (
                        <div className="friends-empty-box">
                          <Send size={32} />
                          <p>{t('friends.task.sentEmpty')}</p>
                        </div>
                      ) : (
                        <ul className="friends-list">
                          {sentTasks.map((st) => (
                            <li key={st.id} className="friends-sent-item">
                              <div className="friends-sent-info">
                                <span className={`friends-sent-title ${st.done ? 'is-done' : ''}`}>{st.title}</span>
                                <div className="friends-sent-meta">
                                  <span>{t('friends.task.recipient', undefined, { email: st.recipientEmail })}</span>
                                  {st.date && (
                                    <span>
                                      <Calendar size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                      {st.date}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`friends-status-badge ${st.done ? 'is-done' : 'is-pending'}`}>
                                {st.done ? t('friends.task.statusDone') : t('friends.task.statusPending')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}

              {assigningToFriend && (
                <form className="friends-assign-box" onSubmit={handleAssignTask}>
                  <h4>
                    {t('friends.action.assignTask')} → {assigningToFriend.email}
                  </h4>
                  <input
                    type="text"
                    className="friends-assign-input"
                    placeholder="Например: сходить в магазин за хлебом..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    autoFocus
                    required
                  />
                  <div className="friends-assign-row">
                    <input type="date" className="friends-assign-input" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                    <select
                      className="friends-assign-input"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    >
                      <option value="low">{t('productivity.priority.low')}</option>
                      <option value="medium">{t('productivity.priority.medium')}</option>
                      <option value="high">{t('productivity.priority.high')}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="icon-button"
                      style={{ fontSize: '0.85rem' }}
                      onClick={() => setAssigningToFriend(null)}
                    >
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="add-button" disabled={isSubmittingTask || !taskTitle.trim()}>
                      <Send size={13} />
                      <span>{t('common.send')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

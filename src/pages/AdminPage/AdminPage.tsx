import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Crown, Database, Eye, Lock, RefreshCw, Search, Shield, Trash2, User, Users, X } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { useTranslation } from '../../lib/i18n'
import { apiFetch } from '../../services/api/apiClient'
import { ViewModeToggle } from '../../shared/ui/ViewModeToggle/ViewModeToggle'
import { useAuthStore, usePageViewMode } from '../../store'
import type { SyncSnapshot } from '../../store/types'
import './AdminPage.css'

type AdminUser = {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export const AdminPage = () => {
  const { lang } = useTranslation()
  const isEn = lang === 'en'

  const currentUser = useAuthStore((state) => state.user)
  const { isSimple, toggleMode } = usePageViewMode('admin')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')

  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null)
  const [userSnapshot, setUserSnapshot] = useState<SyncSnapshot | null>(null)
  const [inspectLoading, setInspectLoading] = useState(false)

  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users')
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return
    const controller = new AbortController()
    void apiFetch<AdminUser[]>('/admin/users', { signal: controller.signal })
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch users')
        }
      })
    return () => controller.abort()
  }, [currentUser])

  const handleInspect = async (user: AdminUser) => {
    setInspectingUser(user)
    setUserSnapshot(null)
    setInspectLoading(true)
    try {
      const snapshot = await apiFetch<SyncSnapshot>(`/admin/users/${user.id}/sync`)
      setUserSnapshot(snapshot)
    } catch {
      setUserSnapshot(null)
    } finally {
      setInspectLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    try {
      await apiFetch(`/admin/users/${deletingUser.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
      setDeletingUser(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !q || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'admin').length
    const regulars = total - admins
    return { total, admins, regulars }
  }, [users])

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <main className="page-shell">
        <AppTopbar />
        <div className="admin-access-denied">
          <div className="admin-access-icon">
            <Lock size={30} />
          </div>
          <h2>{isEn ? 'Admin Access Required' : 'Требуются права администратора'}</h2>
          <p>
            {isEn
              ? 'This section is reserved for system administrators. Please sign in with an administrator account.'
              : 'Этот раздел доступен только системным администраторам. Войди с аккаунта администратора.'}
          </p>
          <Link to="/auth" className="admin-link-btn" style={{ textDecoration: 'none' }}>
            <Shield size={16} />
            <span>{isEn ? 'Go to Authentication' : 'Перейти к авторизации'}</span>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-title-area">
            <div className="admin-title-badge">
              <Crown size={14} />
              <span>{isEn ? 'System Administrator' : 'Системный администратор'}</span>
            </div>
            <h1>{isEn ? 'Control Panel & Database' : 'Панель управления и база данных'}</h1>
            <p className="admin-subtitle">
              {isEn
                ? 'Manage registered users, inspect cloud snapshots, and monitor Cloudflare D1.'
                : 'Управление пользователями, просмотр снимков данных и мониторинг Cloudflare D1.'}
            </p>
          </div>

          <div className="admin-header-actions">
            <ViewModeToggle mode={isSimple ? 'simple' : 'normal'} onChange={toggleMode} />

            <button type="button" className="admin-refresh-btn" onClick={() => void fetchUsers()} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
              <span>{isEn ? 'Refresh' : 'Обновить'}</span>
            </button>
          </div>
        </div>

        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Users size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.total}</span>
              <span className="admin-metric-label">{isEn ? 'Total Users' : 'Всего пользователей'}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Crown size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.admins}</span>
              <span className="admin-metric-label">{isEn ? 'Admins' : 'Администраторов'}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <User size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.regulars}</span>
              <span className="admin-metric-label">{isEn ? 'Regular Users' : 'Пользователей'}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Database size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value" style={{ fontSize: 16, color: '#10b981' }}>
                ONLINE
              </span>
              <span className="admin-metric-label">{isEn ? 'Cloudflare D1' : 'Статус базы D1'}</span>
            </div>
          </div>
        </div>

        <div className="admin-users-panel">
          <div className="admin-filter-bar">
            <div className="admin-search-wrapper">
              <Search size={15} className="admin-search-icon" />
              <input
                type="text"
                placeholder={isEn ? 'Search by email or user ID...' : 'Поиск по email или ID...'}
                className="admin-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-role-filter">
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                {isEn ? 'All' : 'Все'} ({users.length})
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                {isEn ? 'Admins' : 'Админы'} ({stats.admins})
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'user' ? 'active' : ''}`}
                onClick={() => setRoleFilter('user')}
              >
                {isEn ? 'Users' : 'Юзеры'} ({stats.regulars})
              </button>
            </div>
          </div>

          {error && <div className="auth-error-box">{error}</div>}

          {isSimple ? (
            <div className="admin-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>{isEn ? 'User' : 'Пользователь'}</th>
                    <th>{isEn ? 'Role' : 'Роль'}</th>
                    <th>{isEn ? 'Registered' : 'Регистрация'}</th>
                    <th style={{ textAlign: 'right' }}>{isEn ? 'Actions' : 'Действия'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                        {isEn ? 'No users found matching query' : 'Пользователи не найдены'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">{u.email.slice(0, 1).toUpperCase()}</div>
                            <div>
                              <div>{u.email}</div>
                              <span className="admin-user-id-code">{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${u.role}`}>
                            {u.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="admin-inspect-btn"
                              onClick={() => void handleInspect(u)}
                              title={isEn ? 'Inspect cloud snapshot' : 'Просмотреть снимок данных'}
                            >
                              <Eye size={14} />
                              <span>{isEn ? 'Data' : 'Данные'}</span>
                            </button>

                            {u.id !== currentUser.id && (
                              <button
                                type="button"
                                className="admin-delete-btn"
                                onClick={() => setDeletingUser(u)}
                                title={isEn ? 'Delete user' : 'Удалить пользователя'}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-normal-grid">
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  {isEn ? 'No users found matching query' : 'Пользователи не найдены'}
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="admin-user-card">
                    <div className="admin-user-card-head">
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">{u.email.slice(0, 1).toUpperCase()}</div>
                        <div>
                          <strong>{u.email}</strong>
                          <div className="admin-user-id-code">{u.id}</div>
                        </div>
                      </div>
                      <span className={`role-pill ${u.role}`}>
                        {u.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {u.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="admin-user-card-meta">
                      <span>
                        {isEn ? 'Created:' : 'Создан:'} {new Date(u.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="admin-action-btn-group">
                      <button
                        type="button"
                        className="admin-inspect-btn"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => void handleInspect(u)}
                      >
                        <Eye size={14} />
                        <span>{isEn ? 'Inspect Cloud Snapshot' : 'Инспектировать данные'}</span>
                      </button>

                      {u.id !== currentUser.id && (
                        <button type="button" className="admin-delete-btn" onClick={() => setDeletingUser(u)}>
                          <Trash2 size={14} />
                          <span>{isEn ? 'Delete' : 'Удалить'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {inspectingUser && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>
                {isEn ? 'User Cloud Snapshot:' : 'Снимок данных:'} {inspectingUser.email}
              </h3>
              <button type="button" className="admin-modal-close" onClick={() => setInspectingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {inspectLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 10px' }} />
                  <div>{isEn ? 'Loading snapshot from D1...' : 'Загрузка данных из Cloudflare D1...'}</div>
                </div>
              ) : userSnapshot ? (
                <>
                  <div className="snapshot-stats-grid">
                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.productivity?.items?.length || 0}</div>
                      <div className="snapshot-stat-title">{isEn ? 'Tasks / Goals' : 'Задачи и цели'}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.notes?.length || 0}</div>
                      <div className="snapshot-stat-title">{isEn ? 'Notes / Dreams' : 'Заметки / Сны'}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.finance?.entries?.length || 0}</div>
                      <div className="snapshot-stat-title">{isEn ? 'Finance Entries' : 'Транзакции'}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">
                        {(userSnapshot.collection?.movies?.wishlist?.length || 0) +
                          (userSnapshot.collection?.movies?.watched?.length || 0) +
                          (userSnapshot.collection?.books?.wishlist?.length || 0) +
                          (userSnapshot.collection?.games?.wishlist?.length || 0)}
                      </div>
                      <div className="snapshot-stat-title">{isEn ? 'Media Items' : 'Медиатека'}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.shop?.coins ?? 1000} 🪙</div>
                      <div className="snapshot-stat-title">{isEn ? 'Shop Treasury' : 'Казна'}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.favorites?.length || 0}</div>
                      <div className="snapshot-stat-title">{isEn ? 'Favorites' : 'Избранные'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--fg)' }}>
                      {isEn ? 'Raw JSON Payload:' : 'Исходный JSON-снимок:'}
                    </h4>
                    <pre className="snapshot-json-preview">{JSON.stringify(userSnapshot, null, 2)}</pre>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  {isEn ? 'Failed to fetch user snapshot' : 'Не удалось загрузить снимок данных'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal-head">
              <h3>{isEn ? 'Confirm User Deletion' : 'Подтверждение удаления'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeletingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ color: '#ef4444' }}>
                  <AlertTriangle size={32} />
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                  {isEn
                    ? `Are you sure you want to permanently delete user ${deletingUser.email}? All related cloud records will be removed.`
                    : `Удалить пользователя ${deletingUser.email} и все связанные данные из базы D1? Это действие необратимо.`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="admin-refresh-btn" onClick={() => setDeletingUser(null)} disabled={deleteLoading}>
                  {isEn ? 'Cancel' : 'Отмена'}
                </button>
                <button type="button" className="admin-delete-btn" onClick={() => void handleDelete()} disabled={deleteLoading}>
                  <Trash2 size={14} />
                  <span>{deleteLoading ? (isEn ? 'Deleting...' : 'Удаление...') : isEn ? 'Delete Forever' : 'Удалить навсегда'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

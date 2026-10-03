import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, Mail, Sparkles, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { Badge, Button, Modal, Popover, PopoverContent, PopoverTrigger, ScrollArea } from '../../shared/ui'
import { useFriendsStore, useNotificationsStore, useShopStore } from '../../store'
import { useNotifications, type AppNotification, type NotificationType } from './useNotifications'
import './NotificationsBell.css'

const ICONS: Record<NotificationType, LucideIcon> = {
  friendRequest: UserPlus,
  friendTask: Sparkles,
  greeting: Mail,
  referral: CalendarDays,
}

export const NotificationsBell = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notifications, unreadCount } = useNotifications()
  const markAllSeen = useNotificationsStore((state) => state.markAllSeen)
  const lastSeenAt = useNotificationsStore((state) => state.lastSeenAt)

  const acceptRequest = useFriendsStore((state) => state.acceptRequest)
  const declineRequest = useFriendsStore((state) => state.declineRequest)
  const claimGreeting = useShopStore((state) => state.claimFriendGreetingReply)

  const [selected, setSelected] = useState<AppNotification | null>(null)

  const titleOf = (item: AppNotification) => t(`notif.${item.type}.title`)
  const bodyOf = (item: AppNotification) =>
    t(`notif.${item.type}.body`, undefined, { email: item.email ?? '', name: item.name ?? '', title: item.title ?? '' })

  const handleAction = async (item: AppNotification) => {
    if (item.type === 'friendRequest' && item.friendshipId) {
      await acceptRequest(item.friendshipId)
      setSelected(null)
      return
    }
    if (item.type === 'greeting') {
      claimGreeting()
      setSelected(null)
      return
    }
    if (item.type === 'friendTask') {
      navigate('/useful/productivity/task')
      setSelected(null)
      return
    }
    navigate('/auth')
    setSelected(null)
  }

  return (
    <>
      <Popover onOpenChange={(open) => open && markAllSeen()}>
        <PopoverTrigger asChild>
          <button type="button" className="notif-btn" aria-label={t('notif.title')} title={t('notif.title')}>
            <Bell size={16} />
            {unreadCount > 0 && <span className="notif-dot" aria-hidden="true" />}
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="notif-panel">
          <div className="notif-head">
            <strong>{t('notif.title')}</strong>
            {unreadCount > 0 && (
              <Badge variant="accent" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notif-empty">{t('notif.empty')}</p>
          ) : (
            <ScrollArea className="notif-scroll">
              <ul className="notif-list">
                {notifications.map((item, index) => {
                  const Icon = ICONS[item.type]
                  const isUnread = !lastSeenAt || item.createdAt > lastSeenAt
                  return (
                    <li
                      key={item.id}
                      className={`notif-item${isUnread ? ' is-unread' : ''}`}
                      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                    >
                      <button type="button" className="notif-item-btn" onClick={() => setSelected(item)}>
                        <span className="notif-item-icon">
                          <Icon size={15} />
                        </span>
                        <span className="notif-item-text">
                          <strong>{titleOf(item)}</strong>
                          <small>{bodyOf(item)}</small>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? titleOf(selected) : ''} maxWidth={420}>
        {selected && (
          <div className="notif-detail">
            <p className="notif-detail-body">{bodyOf(selected)}</p>

            {selected.type === 'friendTask' && (
              <dl className="notif-detail-meta">
                <div>
                  <dt>{t('notif.from')}</dt>
                  <dd>{selected.name}</dd>
                </div>
                {selected.date && (
                  <div>
                    <dt>{t('notif.date')}</dt>
                    <dd>{selected.date}</dd>
                  </div>
                )}
                {selected.note && (
                  <div>
                    <dt>{t('notif.note')}</dt>
                    <dd>{selected.note}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="notif-detail-actions">
              {selected.type === 'friendRequest' ? (
                <>
                  <Button variant="ghost" onClick={() => selected.friendshipId && void declineRequest(selected.friendshipId)}>
                    {t('notif.action.decline')}
                  </Button>
                  <Button variant="primary" onClick={() => void handleAction(selected)}>
                    {t('notif.action.accept')}
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => void handleAction(selected)}>
                  {selected.type === 'friendTask'
                    ? t('notif.action.openTasks')
                    : selected.type === 'greeting'
                      ? t('notif.action.claim')
                      : t('notif.action.openAccount')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

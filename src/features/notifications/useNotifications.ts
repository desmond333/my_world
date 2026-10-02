import { useMemo } from 'react'
import { useAuthStore, useFriendsStore, useNotificationsStore, useProductivityStore, useShopStore } from '../../store'

export type NotificationType = 'friendRequest' | 'friendTask' | 'greeting' | 'referral'

export type AppNotification = {
  id: string
  type: NotificationType
  createdAt: string
  email?: string
  name?: string
  title?: string
  date?: string
  note?: string
  friendshipId?: string
  referralId?: string
}

export const useNotifications = () => {
  const incoming = useFriendsStore((state) => state.incoming)
  const items = useProductivityStore((state) => state.items)
  const hasPendingGreetingReply = useShopStore((state) => state.hasPendingGreetingReply)
  const greetingFriendName = useShopStore((state) => state.greetingFriendName)
  const greetingTimestamp = useShopStore((state) => state.greetingTimestamp)
  const referralStats = useAuthStore((state) => state.referralStats)
  const lastSeenAt = useNotificationsStore((state) => state.lastSeenAt)

  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = []

    for (const request of incoming) {
      list.push({
        id: `request-${request.id}`,
        type: 'friendRequest',
        createdAt: request.createdAt,
        email: request.email,
        friendshipId: request.friendshipId,
      })
    }

    for (const item of items) {
      if (item.senderName && !item.done) {
        list.push({
          id: `task-${item.id}`,
          type: 'friendTask',
          createdAt: item.createdAt,
          name: item.senderName,
          title: item.title,
          date: item.date,
          note: item.note,
        })
      }
    }

    if (hasPendingGreetingReply) {
      list.push({
        id: 'greeting',
        type: 'greeting',
        createdAt: new Date(greetingTimestamp ?? 0).toISOString(),
        name: greetingFriendName,
      })
    }

    for (const pending of referralStats?.pending ?? []) {
      list.push({ id: `referral-${pending.id}`, type: 'referral', createdAt: pending.createdAt, referralId: pending.id })
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [incoming, items, hasPendingGreetingReply, greetingFriendName, greetingTimestamp, referralStats])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !lastSeenAt || item.createdAt > lastSeenAt).length,
    [notifications, lastSeenAt],
  )

  return { notifications, unreadCount }
}

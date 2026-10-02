import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'

export type NotificationsState = {
  lastSeenAt: string | null
  markAllSeen: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      lastSeenAt: null,
      markAllSeen: () => set({ lastSeenAt: new Date().toISOString() }),
    }),
    { name: STORAGE_KEYS.notificationsSeen, storage: hybridPersistStorage },
  ),
)

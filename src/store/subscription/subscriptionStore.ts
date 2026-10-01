import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import type { Subscription } from '../../data'

const STORAGE_KEY = 'animal-subscriptions'

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type SubscriptionInput = Omit<Subscription, 'id'>

export type SubscriptionStore = {
  items: Subscription[]
  add: (sub: SubscriptionInput) => void
  update: (id: string, patch: Partial<SubscriptionInput>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      items: [],
      add: (sub) => {
        set((state) => ({ items: [...state.items, { ...sub, id: createId() }] }))
        scheduleDebouncedSync()
      },
      update: (id, patch) => {
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        }))
        scheduleDebouncedSync()
      },
      remove: (id) => {
        set((state) => ({ items: state.items.filter((entry) => entry.id !== id) }))
        scheduleDebouncedSync()
      },
      clear: () => {
        set({ items: [] })
        scheduleDebouncedSync()
      },
    }),
    { name: STORAGE_KEY, storage: hybridPersistStorage, version: 1 },
  ),
)

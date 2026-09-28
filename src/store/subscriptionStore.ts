import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subscription } from '../data'

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
      add: (sub) => set((state) => ({ items: [...state.items, { ...sub, id: createId() }] })),
      update: (id, patch) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((entry) => entry.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)

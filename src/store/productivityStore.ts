import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MonthPoints, ProductivityItem, ProductivityKind } from '../data'
import { emptyMonth, POINTS } from '../lib/productivity'
import { monthKey } from '../lib/date'

const STORAGE_KEY = 'animal-productivity'

const bumpMonth = (months: Record<string, MonthPoints>, key: string, kind: ProductivityKind, sign: number) => {
  const current = months[key] ?? emptyMonth()
  const points = current.points + POINTS[kind] * sign
  const counts = { ...current.counts, [kind]: current.counts[kind] + sign }
  const clean = points <= 0 && counts.task <= 0 && counts.goal <= 0 && counts.dream <= 0
  if (clean) {
    const rest = { ...months }
    delete rest[key]
    return rest
  }
  return { ...months, [key]: { points, counts } }
}

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type ProductivityStore = {
  items: ProductivityItem[]
  months: Record<string, MonthPoints>
  add: (kind: ProductivityKind, title: string, date?: string) => void
  toggle: (id: string) => void
  move: (id: string, date: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useProductivityStore = create<ProductivityStore>()(
  persist(
    (set) => ({
      items: [],
      months: {},
      add: (kind, title, date = '') =>
        set((state) => {
          const clean = title.trim()
          if (!clean) return state
          const item: ProductivityItem = {
            id: createId(),
            kind,
            title: clean,
            date,
            done: false,
            createdAt: new Date().toISOString(),
            doneAt: null,
          }
          return { items: [...state.items, item] }
        }),
      move: (id, date) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, date } : entry)),
        })),
      toggle: (id) =>
        set((state) => {
          const item = state.items.find((entry) => entry.id === id)
          if (!item) return state
          const done = !item.done
          const stamp = new Date().toISOString()
          const items = state.items.map((entry) => (entry.id === id ? { ...entry, done, doneAt: done ? stamp : null } : entry))
          return { items, months: bumpMonth(state.months, monthKey(), item.kind, done ? 1 : -1) }
        }),
      remove: (id) =>
        set((state) => {
          const item = state.items.find((entry) => entry.id === id)
          if (!item) return state
          const items = state.items.filter((entry) => entry.id !== id)
          if (!item.done) return { items }
          return { items, months: bumpMonth(state.months, monthKey(), item.kind, -1) }
        }),
      clear: () => set({ items: [], months: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (state) => {
        const saved = state as { items?: Partial<ProductivityItem>[] }
        const items = (saved.items ?? []).map((item) => ({ ...item, date: item.date ?? '' })) as ProductivityItem[]
        return { items, months: (state as { months?: Record<string, MonthPoints> }).months ?? {} }
      },
    },
  ),
)

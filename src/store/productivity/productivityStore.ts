import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'
import type { MonthPoints, ProductivityItem, ProductivityKind, RepeatInterval, TaskPriority } from '../../data'
import { computeNextRepeatDate, emptyMonth, POINTS } from '../../lib/productivity'
import { monthKey } from '../../lib/date'
import { useShopStore } from '../shop'

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

export type ProductivitySnapshot = { items: ProductivityItem[]; months: Record<string, MonthPoints> }

export type MoodEntry = { level: number; note?: string }

export type ProductivityStore = {
  items: ProductivityItem[]
  months: Record<string, MonthPoints>
  mood: Record<string, MoodEntry>
  add: (kind: ProductivityKind, title: string, date?: string, repeat?: RepeatInterval, priority?: TaskPriority) => void
  setMood: (date: string, level: number) => void
  setMoodNote: (date: string, note: string) => void
  clearMood: (date: string) => void
  toggle: (id: string, referenceToday?: string) => void
  move: (id: string, date: string) => void
  reorder: (activeId: string, overId: string) => void
  setRepeat: (id: string, repeat: RepeatInterval) => void
  setPriority: (id: string, priority: TaskPriority) => void
  setNote: (id: string, note: string) => void
  setTitle: (id: string, title: string) => void
  remove: (id: string) => void
  clearDone: (kind?: ProductivityKind) => void
  snapshot: () => ProductivitySnapshot
  restore: (snapshot: ProductivitySnapshot) => void
  clear: () => void
}

export const useProductivityStore = create<ProductivityStore>()(
  persist(
    (set, get) => ({
      items: [],
      months: {},
      mood: {},
      setMood: (date, level) =>
        set((state) => {
          const current = state.mood[date]
          if (current?.level === level) return state
          return { mood: { ...state.mood, [date]: { ...current, level } } }
        }),
      setMoodNote: (date, note) =>
        set((state) => {
          const clean = note.trim()
          const current = state.mood[date]
          if (!current) return state
          if (!clean && !current.note) return state
          if (clean === (current.note ?? '')) return state
          return { mood: { ...state.mood, [date]: { ...current, note: clean || undefined } } }
        }),
      clearMood: (date) =>
        set((state) => {
          if (!state.mood[date]) return state
          const next = { ...state.mood }
          delete next[date]
          return { mood: next }
        }),
      add: (kind, title, date = '', repeat = 'none', priority = 'medium') =>
        set((state) => {
          const clean = title.trim()
          if (!clean) return state
          const item: ProductivityItem = {
            id: createId(),
            kind,
            title: clean,
            date,
            repeat,
            done: false,
            createdAt: new Date().toISOString(),
            doneAt: null,
            priority,
            note: '',
          }
          return { items: [...state.items, item] }
        }),
      move: (id, date) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, date } : entry)),
        })),
      reorder: (activeId, overId) =>
        set((state) => {
          const from = state.items.findIndex((entry) => entry.id === activeId)
          const to = state.items.findIndex((entry) => entry.id === overId)
          if (from < 0 || to < 0 || from === to) return state
          const items = [...state.items]
          const [moved] = items.splice(from, 1)
          items.splice(to, 0, moved)
          return { items }
        }),
      setRepeat: (id, repeat) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, repeat } : entry)),
        })),
      setPriority: (id, priority) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, priority } : entry)),
        })),
      setNote: (id, note) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, note } : entry)),
        })),
      setTitle: (id, title) =>
        set((state) => ({
          items: state.items.map((entry) => (entry.id === id ? { ...entry, title: title.trim() || entry.title } : entry)),
        })),
      toggle: (id, referenceToday = new Date().toISOString().slice(0, 10)) =>
        set((state) => {
          const item = state.items.find((entry) => entry.id === id)
          if (!item) return state
          const done = !item.done
          if (done) {
            useShopStore.getState().addCoins(POINTS[item.kind])
          }
          const stamp = new Date().toISOString()
          let items = state.items.map((entry) => (entry.id === id ? { ...entry, done, doneAt: done ? stamp : null } : entry))

          if (done && item.repeat && item.repeat !== 'none') {
            const nextDate = computeNextRepeatDate(item.date || referenceToday, item.repeat, referenceToday)
            const duplicateExists = state.items.some(
              (entry) =>
                !entry.done &&
                entry.kind === item.kind &&
                entry.title === item.title &&
                entry.repeat === item.repeat &&
                entry.date === nextDate,
            )
            if (!duplicateExists) {
              const nextItem: ProductivityItem = {
                id: createId(),
                kind: item.kind,
                title: item.title,
                date: nextDate,
                repeat: item.repeat,
                done: false,
                createdAt: stamp,
                doneAt: null,
                priority: item.priority,
                note: '',
              }
              items = [...items, nextItem]
            }
          } else if (!done && item.repeat && item.repeat !== 'none') {
            const nextDate = computeNextRepeatDate(item.date || referenceToday, item.repeat, referenceToday)
            items = items.filter(
              (entry) =>
                !(
                  entry.id !== item.id &&
                  !entry.done &&
                  entry.kind === item.kind &&
                  entry.title === item.title &&
                  entry.repeat === item.repeat &&
                  entry.date === nextDate
                ),
            )
          }

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
      clearDone: (kind) =>
        set((state) => {
          const removed = state.items.filter((entry) => entry.done && (!kind || entry.kind === kind))
          if (removed.length === 0) return state
          const ids = new Set(removed.map((entry) => entry.id))
          let months = state.months
          removed.forEach((entry) => {
            months = bumpMonth(months, monthKey(), entry.kind, -1)
          })
          return { items: state.items.filter((entry) => !ids.has(entry.id)), months }
        }),
      snapshot: () => {
        const state = get()
        return { items: state.items.map((entry) => ({ ...entry })), months: { ...state.months } }
      },
      restore: (snapshot) => set({ items: snapshot.items.map((entry) => ({ ...entry })), months: { ...snapshot.months } }),
      clear: () => set({ items: [], months: {} }),
    }),
    {
      name: STORAGE_KEY,
      storage: hybridPersistStorage,
      version: 4,
      migrate: (state) => {
        const saved = state as {
          items?: Partial<ProductivityItem>[]
          months?: Record<string, MonthPoints>
          mood?: Record<string, MoodEntry>
        }
        const items = (saved.items ?? []).map((item) => ({
          ...item,
          date: item.date ?? '',
          repeat: (item.repeat as RepeatInterval) ?? 'none',
          priority: item.priority ?? 'medium',
          note: item.note ?? '',
        })) as ProductivityItem[]
        return { items, months: saved.months ?? {}, mood: saved.mood ?? {} }
      },
    },
  ),
)

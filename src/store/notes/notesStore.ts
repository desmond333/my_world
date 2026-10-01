import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbPersistStorage } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'

const STORAGE_KEY = 'animal-notes'

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type NoteKind = 'note' | 'dream'

export type Note = {
  id: string
  kind: NoteKind
  title: string
  body: string
  parentId?: string | null
  icon?: string | null
  createdAt: string
  updatedAt: string
}

export type NotePatch = Partial<Omit<Note, 'id' | 'createdAt'>>

export type NotesStore = {
  notes: Note[]
  add: (kind?: NoteKind, patch?: NotePatch) => string
  update: (id: string, patch: NotePatch) => void
  remove: (id: string) => void
  move: (id: string, newParentId: string | null) => void
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      add: (kind = 'note', patch) => {
        const now = new Date().toISOString()
        const note: Note = {
          id: createId(),
          kind,
          title: patch?.title ?? '',
          body: patch?.body ?? '',
          parentId: patch?.parentId ?? null,
          icon: patch?.icon ?? null,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ notes: [note, ...state.notes] }))
        scheduleDebouncedSync()
        return note.id
      },
      update: (id, patch) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note)),
        }))
        scheduleDebouncedSync()
      },
      remove: (id) => {
        set((state) => {
          const toDelete = new Set<string>([id])
          let changed = true
          while (changed) {
            changed = false
            for (const n of state.notes) {
              if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
                toDelete.add(n.id)
                changed = true
              }
            }
          }
          return { notes: state.notes.filter((note) => !toDelete.has(note.id)) }
        })
        scheduleDebouncedSync()
      },
      move: (id, newParentId) => {
        set((state) => {
          if (newParentId === id) return state
          if (newParentId) {
            let curr = state.notes.find((n) => n.id === newParentId)
            while (curr && curr.parentId) {
              if (curr.parentId === id) return state
              curr = state.notes.find((n) => n.id === curr?.parentId)
            }
          }
          return {
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, parentId: newParentId, updatedAt: new Date().toISOString() } : note,
            ),
          }
        })
        scheduleDebouncedSync()
      },
    }),
    {
      name: STORAGE_KEY,
      storage: idbPersistStorage,
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as { notes?: Partial<Note>[] }
        return {
          notes: (state?.notes ?? []).map((item) => ({
            ...item,
            kind: item.kind ?? 'note',
            title: item.title ?? '',
            body: item.body ?? '',
            parentId: item.parentId ?? null,
            icon: item.icon ?? null,
            createdAt: item.createdAt ?? new Date().toISOString(),
            updatedAt: item.updatedAt ?? new Date().toISOString(),
          })) as Note[],
        }
      },
    },
  ),
)

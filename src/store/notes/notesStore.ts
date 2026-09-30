import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'animal-notes'

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type NoteKind = 'note' | 'dream'

export type Note = {
  id: string
  kind: NoteKind
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export type NotePatch = Partial<Omit<Note, 'id' | 'createdAt'>>

export type NotesStore = {
  notes: Note[]
  add: (kind?: NoteKind, patch?: NotePatch) => string
  update: (id: string, patch: NotePatch) => void
  remove: (id: string) => void
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
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ notes: [note, ...state.notes] }))
        return note.id
      },
      update: (id, patch) =>
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note)),
        })),
      remove: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { notes?: Partial<Note>[] }
        return {
          notes: (state?.notes ?? []).map((item) => ({
            ...item,
            kind: item.kind ?? 'note',
            title: item.title ?? '',
            body: item.body ?? '',
            createdAt: item.createdAt ?? new Date().toISOString(),
            updatedAt: item.updatedAt ?? new Date().toISOString(),
          })) as Note[],
        }
      },
    },
  ),
)

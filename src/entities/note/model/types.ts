import type { Note, NoteKind } from '../../../data'

export type { Note, NoteKind }

export type NotePatch = Partial<Omit<Note, 'id' | 'createdAt'>>

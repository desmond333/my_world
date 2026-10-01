import { and, desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '../client'
import { notes } from '../schema'
import type { NoteItem, NoteKind } from '../../types'

export const getNotes = async (d1: D1Database, userId: string, kind?: NoteKind, limit = 100, offset = 0): Promise<NoteItem[]> => {
  const db = getDb(d1)
  const conditions = [eq(notes.userId, userId)]
  if (kind) {
    conditions.push(eq(notes.kind, kind))
  }

  const rows = await db
    .select()
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as NoteKind,
    title: row.title,
    body: row.body,
    parentId: row.parentId ?? null,
    icon: row.icon ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export const createNote = async (
  d1: D1Database,
  userId: string,
  note: { kind?: NoteKind; title?: string; body?: string; parentId?: string | null; icon?: string | null },
): Promise<NoteItem> => {
  const db = getDb(d1)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const kind = note.kind || 'note'
  const title = note.title || ''
  const body = note.body || ''
  const parentId = note.parentId ?? null
  const icon = note.icon ?? null

  await db.insert(notes).values({
    id,
    userId,
    kind,
    title,
    body,
    parentId,
    icon,
    createdAt: now,
    updatedAt: now,
  })

  return { id, kind, title, body, parentId, icon, createdAt: now, updatedAt: now }
}

export const updateNote = async (
  d1: D1Database,
  userId: string,
  id: string,
  patch: Partial<Omit<NoteItem, 'id' | 'createdAt'>>,
): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .get()

  if (!existing) return false

  const kind = patch.kind ?? existing.kind
  const title = patch.title !== undefined ? patch.title : existing.title
  const body = patch.body !== undefined ? patch.body : existing.body
  const parentId = patch.parentId !== undefined ? patch.parentId : existing.parentId
  const icon = patch.icon !== undefined ? patch.icon : existing.icon
  const updatedAt = new Date().toISOString()

  await db
    .update(notes)
    .set({ kind, title, body, parentId, icon, updatedAt })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))

  return true
}

export const deleteNote = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const allNotes = await db.select({ id: notes.id, parentId: notes.parentId }).from(notes).where(eq(notes.userId, userId))

  const toDelete = new Set<string>([id])
  let added = true
  while (added) {
    added = false
    for (const n of allNotes) {
      if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
        toDelete.add(n.id)
        added = true
      }
    }
  }

  const ids = Array.from(toDelete)
  await db.delete(notes).where(and(eq(notes.userId, userId), inArray(notes.id, ids)))
  return true
}

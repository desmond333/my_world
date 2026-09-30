import type { NoteItem, NoteKind } from '../../types'

type NoteRow = {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export const getNotes = async (db: D1Database, userId: string, kind?: NoteKind, limit = 100, offset = 0): Promise<NoteItem[]> => {
  let query = 'SELECT * FROM notes WHERE user_id = ?'
  const params: unknown[] = [userId]

  if (kind) {
    query += ' AND kind = ?'
    params.push(kind)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await db
    .prepare(query)
    .bind(...params)
    .all<NoteRow>()

  return results.map((row) => ({
    id: row.id,
    kind: row.kind as NoteKind,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export const createNote = async (
  db: D1Database,
  userId: string,
  note: { kind?: NoteKind; title?: string; body?: string },
): Promise<NoteItem> => {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const kind = note.kind || 'note'
  const title = note.title || ''
  const body = note.body || ''

  await db
    .prepare(
      `INSERT INTO notes (id, user_id, kind, title, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, kind, title, body, now, now)
    .run()

  return { id, kind, title, body, createdAt: now, updatedAt: now }
}

export const updateNote = async (
  db: D1Database,
  userId: string,
  id: string,
  patch: Partial<Omit<NoteItem, 'id' | 'createdAt'>>,
): Promise<boolean> => {
  const existing = await db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').bind(id, userId).first<NoteRow>()

  if (!existing) return false

  const kind = patch.kind ?? existing.kind
  const title = patch.title !== undefined ? patch.title : existing.title
  const body = patch.body !== undefined ? patch.body : existing.body
  const updatedAt = new Date().toISOString()

  await db
    .prepare(
      `UPDATE notes
       SET kind = ?, title = ?, body = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(kind, title, body, updatedAt, id, userId)
    .run()

  return true
}

export const deleteNote = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

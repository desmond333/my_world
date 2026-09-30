import { Hono } from 'hono'
import { safeLimit, safeOffset } from '../db/client'
import { createNote, deleteNote, getNotes, updateNote } from '../db/queries/notes'
import { authMiddleware } from '../middleware/auth'
import type { Env, NoteItem, NoteKind } from '../types'

export const notesRouter = new Hono<{ Bindings: Env }>()

notesRouter.use('*', authMiddleware)

notesRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const kind = c.req.query('kind') as NoteKind | undefined
  const limit = safeLimit(c.req.query('limit'), 100, 500)
  const offset = safeOffset(c.req.query('offset'))

  const notes = await getNotes(c.env.DB, userId, kind, limit, offset)
  return c.json(notes)
})

notesRouter.post('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<{ kind?: NoteKind; title?: string; body?: string }>().catch(() => ({}))
  const created = await createNote(c.env.DB, userId, body)
  return c.json(created, 201)
})

notesRouter.put('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const body = await c.req.json<Partial<Omit<NoteItem, 'id' | 'createdAt'>>>().catch(() => ({}))
  const updated = await updateNote(c.env.DB, userId, id, body)
  if (!updated) {
    return c.json({ error: 'Note not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

notesRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteNote(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Note not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

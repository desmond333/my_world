import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
import { safeLimit, safeOffset } from '../db/client'
import { createNote, deleteNote, getNotes, updateNote } from '../db/queries/notes'
import { createNoteSchema, updateNoteSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import type { Env, NoteKind } from '../types'

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

notesRouter.post(
  '/',
  vValidator('json', createNoteSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid note data', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const userId = c.get('user').userId
    const body = c.req.valid('json')
    const created = await createNote(c.env.DB, userId, body)
    return c.json(created, 201)
  },
)

notesRouter.put(
  '/:id',
  vValidator('json', updateNoteSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid note data', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const body = c.req.valid('json')
    const updated = await updateNote(c.env.DB, userId, id, body)
    if (!updated) {
      return c.json({ error: 'Note not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  },
)

notesRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteNote(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Note not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

import { Hono } from 'hono'
import { createBirthday, deleteBirthday, getBirthdays, setOwnBirthday } from '../db/queries/birthdays'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../types'

export const birthdaysRouter = new Hono<{ Bindings: Env }>()

birthdaysRouter.use('*', authMiddleware)

birthdaysRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const data = await getBirthdays(c.env.DB, userId)
  return c.json(data)
})

birthdaysRouter.post('/', async (c) => {
  const userId = c.get('user').userId
  const body = (await c.req.json().catch(() => ({}))) as { name?: string; date?: string }
  if (!body.name || !body.date) {
    return c.json({ error: 'Name and date are required', code: 'INVALID_DATA' }, 400)
  }
  const created = await createBirthday(c.env.DB, userId, body.name, body.date)
  return c.json(created, 201)
})

birthdaysRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteBirthday(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Birthday not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

birthdaysRouter.put('/own', async (c) => {
  const userId = c.get('user').userId
  const body = (await c.req.json().catch(() => ({}))) as { date?: string }
  if (!body.date) {
    return c.json({ error: 'Date is required', code: 'INVALID_DATA' }, 400)
  }
  await setOwnBirthday(c.env.DB, userId, body.date)
  return c.json({ ownBirthday: body.date })
})

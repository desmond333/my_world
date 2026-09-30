import { Hono } from 'hono'
import { safeLimit, safeOffset } from '../db/client'
import {
  createProductivityItem,
  deleteProductivityItem,
  deleteProductivityMood,
  getProductivityItems,
  getProductivityMonths,
  getProductivityMood,
  setProductivityMonths,
  setProductivityMood,
  updateProductivityItem,
} from '../db/queries/productivity'
import { authMiddleware } from '../middleware/auth'
import type { Env, ProductivityItem, ProductivityMonthRecord } from '../types'

export const productivityRouter = new Hono<{ Bindings: Env }>()

productivityRouter.use('*', authMiddleware)

productivityRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const kind = c.req.query('kind')
  const doneQuery = c.req.query('done')
  const done = doneQuery !== undefined ? doneQuery === '1' || doneQuery === 'true' : undefined
  const limit = safeLimit(c.req.query('limit'), 200, 500)
  const offset = safeOffset(c.req.query('offset'))

  const items = await getProductivityItems(c.env.DB, userId, kind, done, limit, offset)
  return c.json(items)
})

productivityRouter.post('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Omit<ProductivityItem, 'id' | 'createdAt'>>().catch(() => ({}) as never)
  if (!body.kind || !body.title) {
    return c.json({ error: 'Kind and title are required', code: 'INVALID_DATA' }, 400)
  }
  const created = await createProductivityItem(c.env.DB, userId, body)
  return c.json(created, 201)
})

productivityRouter.put('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const body = await c.req.json<Partial<ProductivityItem>>().catch(() => ({}))
  const updated = await updateProductivityItem(c.env.DB, userId, id, body)
  if (!updated) {
    return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

productivityRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteProductivityItem(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

productivityRouter.get('/months', async (c) => {
  const userId = c.get('user').userId
  const months = await getProductivityMonths(c.env.DB, userId)
  return c.json({ months })
})

productivityRouter.put('/months', async (c) => {
  const userId = c.get('user').userId
  const rawBody = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  const months = (
    'months' in rawBody && typeof rawBody.months === 'object' && rawBody.months !== null ? rawBody.months : rawBody
  ) as Record<string, ProductivityMonthRecord>
  await setProductivityMonths(c.env.DB, userId, months || {})
  return c.json({ success: true })
})

productivityRouter.get('/mood', async (c) => {
  const userId = c.get('user').userId
  const mood = await getProductivityMood(c.env.DB, userId)
  return c.json(mood)
})

productivityRouter.put('/mood/:date', async (c) => {
  const userId = c.get('user').userId
  const date = c.req.param('date')
  const body = (await c.req.json().catch(() => ({}))) as { level?: number; note?: string }
  if (body.level === undefined || Number.isNaN(body.level)) {
    return c.json({ error: 'Level is required', code: 'INVALID_DATA' }, 400)
  }
  await setProductivityMood(c.env.DB, userId, date, body.level, body.note || '')
  return c.json({ success: true, date, level: body.level, note: body.note || '' })
})

productivityRouter.delete('/mood/:date', async (c) => {
  const userId = c.get('user').userId
  const date = c.req.param('date')
  const deleted = await deleteProductivityMood(c.env.DB, userId, date)
  if (!deleted) {
    return c.json({ error: 'Mood record not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
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
import { createProductivityItemSchema, updateProductivityItemSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import type { Env, ProductivityItem, ProductivityKind, ProductivityMonthRecord } from '../types'

export const productivityRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('user').userId
    const kind = c.req.query('kind')
    const doneQuery = c.req.query('done')
    const done = doneQuery !== undefined ? doneQuery === '1' || doneQuery === 'true' : undefined
    const limit = safeLimit(c.req.query('limit'), 200, 500)
    const offset = safeOffset(c.req.query('offset'))

    const items = await getProductivityItems(c.env.DB, userId, kind, done, limit, offset)
    return c.json(items)
  })
  .post(
    '/',
    vValidator('json', createProductivityItemSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Kind and title are required', issues: result.issues }, 400)
      }
    }),
    async (c) => {
      const userId = c.get('user').userId
      const body = c.req.valid('json')
      const itemData: Omit<ProductivityItem, 'id' | 'createdAt'> = {
        kind: (body.kind as ProductivityKind) || 'task',
        title: body.title,
        date: body.date ?? '',
        repeat: (body.repeat as ProductivityItem['repeat']) || 'none',
        done: body.done ?? false,
        doneAt: null,
        priority: (body.priority as ProductivityItem['priority']) || undefined,
        note: body.note ?? '',
      }
      const created = await createProductivityItem(c.env.DB, userId, itemData)
      return c.json(created, 201)
    },
  )
  .put(
    '/:id',
    vValidator('json', updateProductivityItemSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid productivity data', issues: result.issues }, 400)
      }
    }),
    async (c) => {
      const userId = c.get('user').userId
      const id = c.req.param('id')
      const body = c.req.valid('json')
      const updated = await updateProductivityItem(c.env.DB, userId, id, {
        ...body,
        repeat: body.repeat as ProductivityItem['repeat'],
        priority: (body.priority as ProductivityItem['priority']) || undefined,
      })
      if (!updated) {
        return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
      }
      return c.json({ success: true })
    },
  )
  .delete('/:id', async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const deleted = await deleteProductivityItem(c.env.DB, userId, id)
    if (!deleted) {
      return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  })
  .get('/months', async (c) => {
    const userId = c.get('user').userId
    const months = await getProductivityMonths(c.env.DB, userId)
    return c.json({ months })
  })
  .put('/months', async (c) => {
    const userId = c.get('user').userId
    const rawBody = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const months = (
      'months' in rawBody && typeof rawBody.months === 'object' && rawBody.months !== null ? rawBody.months : rawBody
    ) as Record<string, ProductivityMonthRecord>
    await setProductivityMonths(c.env.DB, userId, months || {})
    return c.json({ success: true })
  })
  .get('/mood', async (c) => {
    const userId = c.get('user').userId
    const mood = await getProductivityMood(c.env.DB, userId)
    return c.json(mood)
  })
  .put('/mood/:date', async (c) => {
    const userId = c.get('user').userId
    const date = c.req.param('date')
    const body = (await c.req.json().catch(() => ({}))) as { level?: number; note?: string }
    if (body.level === undefined || Number.isNaN(body.level)) {
      return c.json({ error: 'Level is required', code: 'INVALID_DATA' }, 400)
    }
    await setProductivityMood(c.env.DB, userId, date, body.level, body.note || '')
    return c.json({ success: true, date, level: body.level, note: body.note || '' })
  })
  .delete('/mood/:date', async (c) => {
    const userId = c.get('user').userId
    const date = c.req.param('date')
    const deleted = await deleteProductivityMood(c.env.DB, userId, date)
    if (!deleted) {
      return c.json({ error: 'Mood record not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  })

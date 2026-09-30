import { Hono } from 'hono'
import { safeLimit, safeOffset } from '../db/client'
import {
  createFinanceEntry,
  deleteFinanceEntry,
  getFinanceBalance,
  getFinanceEntries,
  getFinanceRates,
  updateFinanceBalance,
  updateFinanceEntry,
  updateFinanceRates,
} from '../db/queries/finance'
import { authMiddleware } from '../middleware/auth'
import type { Currency, Env, FinanceEntry } from '../types'

export const financeRouter = new Hono<{ Bindings: Env }>()

financeRouter.use('*', authMiddleware)

financeRouter.get('/entries', async (c) => {
  const userId = c.get('user').userId
  const month = c.req.query('month')
  const limit = safeLimit(c.req.query('limit'), 100, 500)
  const offset = safeOffset(c.req.query('offset'))
  const entries = await getFinanceEntries(c.env.DB, userId, month, limit, offset)
  return c.json(entries)
})

financeRouter.post('/entries', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Omit<FinanceEntry, 'id' | 'createdAt'>>().catch(() => ({}) as never)
  if (!body.month || !body.kind || body.amount === undefined || !body.currency) {
    return c.json({ error: 'Missing required entry fields', code: 'INVALID_DATA' }, 400)
  }
  const created = await createFinanceEntry(c.env.DB, userId, body)
  return c.json(created, 201)
})

financeRouter.put('/entries/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const body = await c.req.json<Partial<FinanceEntry>>().catch(() => ({}))
  const updated = await updateFinanceEntry(c.env.DB, userId, id, body)
  if (!updated) {
    return c.json({ error: 'Entry not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

financeRouter.delete('/entries/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteFinanceEntry(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Entry not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

financeRouter.get('/balance', async (c) => {
  const userId = c.get('user').userId
  const balance = await getFinanceBalance(c.env.DB, userId)
  return c.json(balance)
})

financeRouter.put('/balance', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Partial<Record<Currency, number>>>().catch(() => ({}))
  const updated = await updateFinanceBalance(c.env.DB, userId, body)
  return c.json(updated)
})

financeRouter.get('/rates', async (c) => {
  const userId = c.get('user').userId
  const rates = await getFinanceRates(c.env.DB, userId)
  return c.json(rates)
})

financeRouter.put('/rates', async (c) => {
  const userId = c.get('user').userId
  const body = (await c.req.json().catch(() => ({}))) as { rates?: Partial<Record<Currency, number>>; source?: string }
  const updated = await updateFinanceRates(c.env.DB, userId, body.rates || {}, body.source || 'manual')
  return c.json(updated)
})

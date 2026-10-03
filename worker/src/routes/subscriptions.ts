import { Hono } from 'hono'
import { createSubscription, deleteSubscription, getSubscriptions, updateSubscription } from '../db/queries/subscriptions'
import { authMiddleware } from '../middleware/auth'
import type { Env, Subscription } from '../types'

export const subscriptionsRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('user').userId
    const items = await getSubscriptions(c.env.DB, userId)
    return c.json(items)
  })
  .post('/', async (c) => {
    const userId = c.get('user').userId
    const body = await c.req.json<Omit<Subscription, 'id'>>().catch(() => ({}) as never)
    if (!body.name || body.price === undefined || !body.currency || !body.period) {
      return c.json({ error: 'Missing required subscription fields', code: 'INVALID_DATA' }, 400)
    }
    const created = await createSubscription(c.env.DB, userId, body)
    return c.json(created, 201)
  })
  .put('/:id', async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const body = await c.req.json<Partial<Subscription>>().catch(() => ({}))
    const updated = await updateSubscription(c.env.DB, userId, id, body)
    if (!updated) {
      return c.json({ error: 'Subscription not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  })
  .delete('/:id', async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const deleted = await deleteSubscription(c.env.DB, userId, id)
    if (!deleted) {
      return c.json({ error: 'Subscription not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  })

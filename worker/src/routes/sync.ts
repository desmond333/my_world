import { Hono } from 'hono'
import { applySyncSnapshot, getSyncSnapshot } from '../db/queries/sync'
import { authMiddleware } from '../middleware/auth'
import type { Env, SyncSnapshot } from '../types'

export const syncRouter = new Hono<{ Bindings: Env }>()

syncRouter.use('*', authMiddleware)

syncRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const snapshot = await getSyncSnapshot(c.env.DB, userId)
  return c.json(snapshot)
})

syncRouter.post('/', async (c) => {
  const userId = c.get('user').userId
  const snapshot = await c.req.json<SyncSnapshot>().catch(() => null)
  if (!snapshot) {
    return c.json({ error: 'Valid snapshot payload is required', code: 'INVALID_DATA' }, 400)
  }

  await applySyncSnapshot(c.env.DB, userId, snapshot)
  return c.json({ success: true })
})

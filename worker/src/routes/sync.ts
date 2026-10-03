import { Hono } from 'hono'
import { applySyncSnapshot, getSyncSnapshot } from '../db/queries/sync'
import { parseSyncSnapshot } from '../lib/snapshotSchema'
import { authMiddleware } from '../middleware/auth'
import type { Env, SyncSnapshot } from '../types'

export const syncRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('user').userId
    const snapshot = await getSyncSnapshot(c.env.DB, userId)
    return c.json(snapshot)
  })
  .post('/', async (c) => {
    const userId = c.get('user').userId
    const raw = await c.req.json<unknown>().catch(() => null)
    const snapshot = parseSyncSnapshot(raw)
    if (!snapshot) {
      return c.json({ error: 'Valid snapshot payload is required', code: 'INVALID_DATA' }, 400)
    }

    await applySyncSnapshot(c.env.DB, userId, snapshot as SyncSnapshot)
    return c.json({ success: true })
  })

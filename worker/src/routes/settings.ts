import { Hono } from 'hono'
import { getSettings, upsertSettings } from '../db/queries/settings'
import { authMiddleware } from '../middleware/auth'
import type { Env, SettingsData } from '../types'

export const settingsRouter = new Hono<{ Bindings: Env }>()

settingsRouter.use('*', authMiddleware)

settingsRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const settings = await getSettings(c.env.DB, userId)
  return c.json(settings)
})

settingsRouter.put('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Partial<SettingsData>>().catch(() => ({}))
  const updated = await upsertSettings(c.env.DB, userId, body)
  return c.json(updated)
})

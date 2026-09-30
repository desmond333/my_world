import { Hono } from 'hono'
import { getViewModes, updateViewModes } from '../db/queries/viewModes'
import { authMiddleware } from '../middleware/auth'
import type { Env, ViewModesData } from '../types'

export const viewModesRouter = new Hono<{ Bindings: Env }>()

viewModesRouter.use('*', authMiddleware)

viewModesRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const data = await getViewModes(c.env.DB, userId)
  return c.json(data)
})

viewModesRouter.put('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Partial<ViewModesData>>().catch(() => ({}))
  const updated = await updateViewModes(c.env.DB, userId, body)
  return c.json(updated)
})

import { Hono } from 'hono'
import { getShopState, updateShopState } from '../db/queries/shop'
import { authMiddleware } from '../middleware/auth'
import type { Env, ShopStateData } from '../types'

export const shopRouter = new Hono<{ Bindings: Env }>()

shopRouter.use('*', authMiddleware)

shopRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const state = await getShopState(c.env.DB, userId)
  return c.json(state)
})

shopRouter.put('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Partial<ShopStateData>>().catch(() => ({}))
  const updated = await updateShopState(c.env.DB, userId, body)
  return c.json(updated)
})

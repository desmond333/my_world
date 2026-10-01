import { Hono } from 'hono'
import { applyCoinOps, getShopState, purchaseShopItem, updateShopState } from '../db/queries/shop'
import { authMiddleware } from '../middleware/auth'
import type { Env, ShopStateData } from '../types'

export const shopRouter = new Hono<{ Bindings: Env }>()

shopRouter.use('*', authMiddleware)

shopRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const state = await getShopState(c.env.DB, userId)
  return c.json(state)
})

shopRouter.post('/earn', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<{ ops?: unknown }>().catch(() => ({}) as { ops?: unknown })
  const rawOps = Array.isArray(body.ops) ? body.ops : []

  const ops = rawOps
    .filter(
      (op): op is { id: string; reason: string; amount: number } =>
        typeof op === 'object' &&
        op !== null &&
        typeof (op as { id?: unknown }).id === 'string' &&
        typeof (op as { reason?: unknown }).reason === 'string' &&
        typeof (op as { amount?: unknown }).amount === 'number',
    )
    .slice(0, 50)

  const result = await applyCoinOps(c.env.DB, userId, ops)
  return c.json(result)
})

shopRouter.post('/buy', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<{ key?: string }>().catch(() => ({}) as { key?: string })
  const result = await purchaseShopItem(c.env.DB, userId, String(body.key ?? ''))

  if (!result.ok) {
    const status = result.error === 'INVALID_KEY' ? 400 : 402
    return c.json({ error: result.error, coins: result.state.coins }, status)
  }

  return c.json(result.state)
})

shopRouter.put('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Partial<ShopStateData>>().catch(() => ({}) as Partial<ShopStateData>)

  // coins и unlockedParts — серверные; клиент может менять только косметику и приветствия
  const patch: Partial<ShopStateData> = {}
  if (body.activeCatSkin !== undefined) patch.activeCatSkin = body.activeCatSkin
  if (body.activeThemeSkin !== undefined) patch.activeThemeSkin = body.activeThemeSkin
  if (body.greetingSent !== undefined) patch.greetingSent = body.greetingSent
  if (body.greetingFriendName !== undefined) patch.greetingFriendName = body.greetingFriendName
  if (body.greetingTimestamp !== undefined) patch.greetingTimestamp = body.greetingTimestamp
  if (body.greetingRewardClaimed !== undefined) patch.greetingRewardClaimed = body.greetingRewardClaimed
  if (body.hasPendingGreetingReply !== undefined) patch.hasPendingGreetingReply = body.hasPendingGreetingReply

  const updated = await updateShopState(c.env.DB, userId, patch)
  return c.json(updated)
})

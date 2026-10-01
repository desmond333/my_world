import { Hono } from 'hono'
import { desc, eq, or } from 'drizzle-orm'
import { getDb } from '../db/client'
import {
  availabilityWindows,
  birthdays,
  collectionItems,
  favorites,
  financeBalance,
  financeEntries,
  financeRates,
  friendships,
  lotteryStats,
  notes,
  ownBirthday,
  productivityItems,
  productivityMonths,
  productivityMood,
  refreshTokens,
  settings,
  shopState,
  subscriptions,
  trainingDays,
  trainingSports,
  users,
  viewModes,
} from '../db/schema'
import { getSyncSnapshot } from '../db/queries/sync'
import { adminMiddleware } from '../middleware/admin'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../types'

export const adminRouter = new Hono<{ Bindings: Env }>()

adminRouter.use('*', authMiddleware, adminMiddleware)

adminRouter.get('/users', async (c) => {
  const appDb = getDb(c.env.DB)
  const results = await appDb
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return c.json(results)
})

adminRouter.get('/users/:userId', async (c) => {
  const targetId = c.req.param('userId')
  const appDb = getDb(c.env.DB)
  const user = await appDb
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, targetId))
    .get()

  if (!user) {
    return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json(user)
})

adminRouter.get('/users/:userId/sync', async (c) => {
  const targetId = c.req.param('userId')
  const appDb = getDb(c.env.DB)
  const user = await appDb.select({ id: users.id }).from(users).where(eq(users.id, targetId)).get()

  if (!user) {
    return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
  }

  const snapshot = await getSyncSnapshot(c.env.DB, targetId)
  return c.json(snapshot)
})

adminRouter.delete('/users/:userId', async (c) => {
  const targetId = c.req.param('userId')
  const appDb = getDb(c.env.DB)

  await appDb.delete(friendships).where(or(eq(friendships.userId, targetId), eq(friendships.friendId, targetId)))
  await appDb.delete(refreshTokens).where(eq(refreshTokens.userId, targetId))
  await appDb.delete(availabilityWindows).where(eq(availabilityWindows.userId, targetId))
  await appDb.delete(settings).where(eq(settings.userId, targetId))
  await appDb.delete(trainingDays).where(eq(trainingDays.userId, targetId))
  await appDb.delete(trainingSports).where(eq(trainingSports.userId, targetId))
  await appDb.delete(financeEntries).where(eq(financeEntries.userId, targetId))
  await appDb.delete(financeBalance).where(eq(financeBalance.userId, targetId))
  await appDb.delete(financeRates).where(eq(financeRates.userId, targetId))
  await appDb.delete(productivityItems).where(eq(productivityItems.userId, targetId))
  await appDb.delete(productivityMonths).where(eq(productivityMonths.userId, targetId))
  await appDb.delete(productivityMood).where(eq(productivityMood.userId, targetId))
  await appDb.delete(subscriptions).where(eq(subscriptions.userId, targetId))
  await appDb.delete(birthdays).where(eq(birthdays.userId, targetId))
  await appDb.delete(ownBirthday).where(eq(ownBirthday.userId, targetId))
  await appDb.delete(collectionItems).where(eq(collectionItems.userId, targetId))
  await appDb.delete(favorites).where(eq(favorites.userId, targetId))
  await appDb.delete(lotteryStats).where(eq(lotteryStats.userId, targetId))
  await appDb.delete(notes).where(eq(notes.userId, targetId))
  await appDb.delete(shopState).where(eq(shopState.userId, targetId))
  await appDb.delete(viewModes).where(eq(viewModes.userId, targetId))
  await appDb.delete(users).where(eq(users.id, targetId))

  return c.json({ success: true })
})

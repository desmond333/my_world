import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
import * as v from 'valibot'
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
import { deleteContactMessage, listContactMessages, setContactMessageStatus } from '../db/queries/contact'
import { isPremiumActive } from '../lib/premium'
import { adminMiddleware } from '../middleware/admin'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../types'

const premiumUpdateSchema = v.object({ premium: v.boolean() })
const messageStatusSchema = v.object({ status: v.picklist(['new', 'read']) })

export const adminRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware, adminMiddleware)
  .get('/users', async (c) => {
    const appDb = getDb(c.env.DB)
    const results = await appDb
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    return c.json(
      results.map((user) => ({
        ...user,
        premium: isPremiumActive({ isPremium: user.isPremium, premiumUntil: user.premiumUntil }, new Date().toISOString()),
      })),
    )
  })
  .get('/users/:userId', async (c) => {
    const targetId = c.req.param('userId')
    const appDb = getDb(c.env.DB)
    const user = await appDb
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
      })
      .from(users)
      .where(eq(users.id, targetId))
      .get()

    if (!user) {
      return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
    }

    return c.json({
      ...user,
      premium: isPremiumActive({ isPremium: user.isPremium, premiumUntil: user.premiumUntil }, new Date().toISOString()),
    })
  })
  .post('/users/:userId/premium', vValidator('json', premiumUpdateSchema), async (c) => {
    const targetId = c.req.param('userId')
    const body = c.req.valid('json')

    const appDb = getDb(c.env.DB)
    const existing = await appDb.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, targetId)).get()
    if (!existing) {
      return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
    }

    await appDb
      .update(users)
      .set({ isPremium: body.premium ? 1 : 0 })
      .where(eq(users.id, targetId))
    const premium = body.premium || existing.role === 'admin'
    return c.json({ id: targetId, premium })
  })
  .get('/users/:userId/sync', async (c) => {
    const targetId = c.req.param('userId')
    const appDb = getDb(c.env.DB)
    const user = await appDb.select({ id: users.id }).from(users).where(eq(users.id, targetId)).get()

    if (!user) {
      return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
    }

    const snapshot = await getSyncSnapshot(c.env.DB, targetId)
    return c.json(snapshot)
  })
  .delete('/users/:userId', async (c) => {
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
  .get('/messages', async (c) => {
    const messages = await listContactMessages(c.env.DB)
    return c.json(messages)
  })
  .post('/messages/:messageId/status', vValidator('json', messageStatusSchema), async (c) => {
    const messageId = c.req.param('messageId')
    const status = c.req.valid('json').status

    const updated = await setContactMessageStatus(c.env.DB, messageId, status)
    if (!updated) {
      return c.json({ error: 'Message not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true, status })
  })
  .delete('/messages/:messageId', async (c) => {
    const deleted = await deleteContactMessage(c.env.DB, c.req.param('messageId'))
    if (!deleted) {
      return c.json({ error: 'Message not found', code: 'NOT_FOUND' }, 404)
    }
    return c.json({ success: true })
  })

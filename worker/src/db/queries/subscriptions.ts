import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { subscriptions } from '../schema'
import type { Currency, Subscription, SubscriptionPeriod } from '../../types'

export const getSubscriptions = async (d1: D1Database, userId: string): Promise<Subscription[]> => {
  const db = getDb(d1)
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.startedAt))

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    currency: row.currency as Currency,
    period: row.period as SubscriptionPeriod,
    startedAt: row.startedAt,
    until: row.until,
    note: row.note,
  }))
}

export const createSubscription = async (d1: D1Database, userId: string, item: Omit<Subscription, 'id'>): Promise<Subscription> => {
  const db = getDb(d1)
  const id = crypto.randomUUID()

  await db.insert(subscriptions).values({
    id,
    userId,
    name: item.name,
    price: item.price,
    currency: item.currency,
    period: item.period,
    startedAt: item.startedAt,
    until: item.until,
    note: item.note || '',
  })

  return {
    id,
    name: item.name,
    price: item.price,
    currency: item.currency,
    period: item.period,
    startedAt: item.startedAt,
    until: item.until,
    note: item.note || '',
  }
}

export const updateSubscription = async (d1: D1Database, userId: string, id: string, patch: Partial<Subscription>): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .get()

  if (!existing) return false

  await db
    .update(subscriptions)
    .set({
      name: patch.name ?? existing.name,
      price: patch.price ?? existing.price,
      currency: patch.currency ?? existing.currency,
      period: patch.period ?? existing.period,
      startedAt: patch.startedAt ?? existing.startedAt,
      until: patch.until ?? existing.until,
      note: patch.note !== undefined ? patch.note : existing.note,
    })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))

  return true
}

export const deleteSubscription = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(subscriptions).where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
  return (res.meta.changes ?? 0) > 0
}

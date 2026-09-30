import type { Currency, Subscription, SubscriptionPeriod } from '../../types'

type SubscriptionRow = {
  id: string
  user_id: string
  name: string
  price: number
  currency: string
  period: string
  started_at: string
  until: string
  note: string
}

export const getSubscriptions = async (db: D1Database, userId: string): Promise<Subscription[]> => {
  const { results } = await db
    .prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY started_at DESC')
    .bind(userId)
    .all<SubscriptionRow>()

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    currency: row.currency as Currency,
    period: row.period as SubscriptionPeriod,
    startedAt: row.started_at,
    until: row.until,
    note: row.note,
  }))
}

export const createSubscription = async (db: D1Database, userId: string, item: Omit<Subscription, 'id'>): Promise<Subscription> => {
  const id = crypto.randomUUID()

  await db
    .prepare(
      `INSERT INTO subscriptions (id, user_id, name, price, currency, period, started_at, until, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, item.name, item.price, item.currency, item.period, item.startedAt, item.until, item.note || '')
    .run()

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

export const updateSubscription = async (db: D1Database, userId: string, id: string, patch: Partial<Subscription>): Promise<boolean> => {
  const existing = await db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').bind(id, userId).first<SubscriptionRow>()

  if (!existing) return false

  const name = patch.name ?? existing.name
  const price = patch.price !== undefined ? patch.price : existing.price
  const currency = patch.currency ?? existing.currency
  const period = patch.period ?? existing.period
  const startedAt = patch.startedAt ?? existing.started_at
  const until = patch.until ?? existing.until
  const note = patch.note !== undefined ? patch.note : existing.note

  await db
    .prepare(
      `UPDATE subscriptions
       SET name = ?, price = ?, currency = ?, period = ?, started_at = ?, until = ?, note = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(name, price, currency, period, startedAt, until, note, id, userId)
    .run()

  return true
}

export const deleteSubscription = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

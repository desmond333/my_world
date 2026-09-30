import type { Currency, FinanceEntry, FinanceKind } from '../../types'

type FinanceEntryRow = {
  id: string
  user_id: string
  month: string
  kind: string
  amount: number
  currency: string
  note: string
  created_at: string
}

type BalanceRow = {
  rub: number
  usd: number
  gel: number
}

type RatesRow = {
  rub: number
  usd: number
  gel: number
  source: string
  updated_at: string | null
}

export const getFinanceEntries = async (
  db: D1Database,
  userId: string,
  month?: string,
  limit = 100,
  offset = 0,
): Promise<FinanceEntry[]> => {
  let query = 'SELECT * FROM finance_entries WHERE user_id = ?'
  const params: unknown[] = [userId]

  if (month) {
    query += ' AND month = ?'
    params.push(month)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await db
    .prepare(query)
    .bind(...params)
    .all<FinanceEntryRow>()

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    kind: row.kind as FinanceKind,
    amount: row.amount,
    currency: row.currency as Currency,
    note: row.note,
    createdAt: row.created_at,
  }))
}

export const createFinanceEntry = async (
  db: D1Database,
  userId: string,
  entry: Omit<FinanceEntry, 'id' | 'createdAt'>,
): Promise<FinanceEntry> => {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO finance_entries (id, user_id, month, kind, amount, currency, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, entry.month, entry.kind, entry.amount, entry.currency, entry.note || '', createdAt)
    .run()

  return {
    id,
    month: entry.month,
    kind: entry.kind,
    amount: entry.amount,
    currency: entry.currency,
    note: entry.note || '',
    createdAt,
  }
}

export const updateFinanceEntry = async (db: D1Database, userId: string, id: string, patch: Partial<FinanceEntry>): Promise<boolean> => {
  const existing = await db.prepare('SELECT * FROM finance_entries WHERE id = ? AND user_id = ?').bind(id, userId).first<FinanceEntryRow>()

  if (!existing) return false

  const month = patch.month ?? existing.month
  const kind = patch.kind ?? existing.kind
  const amount = patch.amount !== undefined ? patch.amount : existing.amount
  const currency = patch.currency ?? existing.currency
  const note = patch.note !== undefined ? patch.note : existing.note

  await db
    .prepare(
      `UPDATE finance_entries
       SET month = ?, kind = ?, amount = ?, currency = ?, note = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(month, kind, amount, currency, note, id, userId)
    .run()

  return true
}

export const deleteFinanceEntry = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM finance_entries WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

export const getFinanceBalance = async (db: D1Database, userId: string): Promise<Record<Currency, number>> => {
  const row = await db.prepare('SELECT * FROM finance_balance WHERE user_id = ?').bind(userId).first<BalanceRow>()

  if (!row) {
    return { RUB: 0, USD: 0, GEL: 0 }
  }

  return {
    RUB: row.rub,
    USD: row.usd,
    GEL: row.gel,
  }
}

export const updateFinanceBalance = async (
  db: D1Database,
  userId: string,
  balance: Partial<Record<Currency, number>>,
): Promise<Record<Currency, number>> => {
  const current = await getFinanceBalance(db, userId)
  const merged: Record<Currency, number> = {
    RUB: balance.RUB !== undefined ? balance.RUB : current.RUB,
    USD: balance.USD !== undefined ? balance.USD : current.USD,
    GEL: balance.GEL !== undefined ? balance.GEL : current.GEL,
  }

  await db
    .prepare(
      `INSERT INTO finance_balance (user_id, rub, usd, gel)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         rub = excluded.rub,
         usd = excluded.usd,
         gel = excluded.gel`,
    )
    .bind(userId, merged.RUB, merged.USD, merged.GEL)
    .run()

  return merged
}

export const getFinanceRates = async (
  db: D1Database,
  userId: string,
): Promise<{ rates: Record<Currency, number>; source: string; updatedAt: string | null }> => {
  const row = await db.prepare('SELECT * FROM finance_rates WHERE user_id = ?').bind(userId).first<RatesRow>()

  if (!row) {
    return {
      rates: { RUB: 1, USD: 90, GEL: 33 },
      source: 'default',
      updatedAt: null,
    }
  }

  return {
    rates: {
      RUB: row.rub,
      USD: row.usd,
      GEL: row.gel,
    },
    source: row.source,
    updatedAt: row.updated_at,
  }
}

export const updateFinanceRates = async (
  db: D1Database,
  userId: string,
  rates: Partial<Record<Currency, number>>,
  source = 'manual',
): Promise<{ rates: Record<Currency, number>; source: string; updatedAt: string }> => {
  const current = await getFinanceRates(db, userId)
  const mergedRates: Record<Currency, number> = {
    RUB: rates.RUB !== undefined ? rates.RUB : current.rates.RUB,
    USD: rates.USD !== undefined ? rates.USD : current.rates.USD,
    GEL: rates.GEL !== undefined ? rates.GEL : current.rates.GEL,
  }
  const updatedAt = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO finance_rates (user_id, rub, usd, gel, source, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         rub = excluded.rub,
         usd = excluded.usd,
         gel = excluded.gel,
         source = excluded.source,
         updated_at = excluded.updated_at`,
    )
    .bind(userId, mergedRates.RUB, mergedRates.USD, mergedRates.GEL, source, updatedAt)
    .run()

  return {
    rates: mergedRates,
    source,
    updatedAt,
  }
}

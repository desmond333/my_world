import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { financeBalance, financeEntries, financeRates } from '../schema'
import type { Currency, FinanceEntry, FinanceKind } from '../../types'

export const getFinanceEntries = async (
  d1: D1Database,
  userId: string,
  month?: string,
  limit = 100,
  offset = 0,
): Promise<FinanceEntry[]> => {
  const db = getDb(d1)
  const conditions = [eq(financeEntries.userId, userId)]
  if (month) {
    conditions.push(eq(financeEntries.month, month))
  }

  const rows = await db
    .select()
    .from(financeEntries)
    .where(and(...conditions))
    .orderBy(desc(financeEntries.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((row) => ({
    id: row.id,
    month: row.month,
    kind: row.kind as FinanceKind,
    amount: row.amount,
    currency: row.currency as Currency,
    note: row.note,
    createdAt: row.createdAt,
  }))
}

export const createFinanceEntry = async (
  d1: D1Database,
  userId: string,
  entry: Omit<FinanceEntry, 'id' | 'createdAt'>,
): Promise<FinanceEntry> => {
  const db = getDb(d1)
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await db.insert(financeEntries).values({
    id,
    userId,
    month: entry.month,
    kind: entry.kind,
    amount: entry.amount,
    currency: entry.currency,
    note: entry.note || '',
    createdAt,
  })

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

export const updateFinanceEntry = async (d1: D1Database, userId: string, id: string, patch: Partial<FinanceEntry>): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(financeEntries)
    .where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId)))
    .get()

  if (!existing) return false

  await db
    .update(financeEntries)
    .set({
      month: patch.month ?? existing.month,
      kind: patch.kind ?? existing.kind,
      amount: patch.amount !== undefined ? patch.amount : existing.amount,
      currency: patch.currency ?? existing.currency,
      note: patch.note !== undefined ? patch.note : existing.note,
    })
    .where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId)))

  return true
}

export const deleteFinanceEntry = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(financeEntries).where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId)))
  return (res.meta.changes ?? 0) > 0
}

export const getFinanceBalance = async (d1: D1Database, userId: string): Promise<Record<Currency, number>> => {
  const db = getDb(d1)
  const row = await db.select().from(financeBalance).where(eq(financeBalance.userId, userId)).get()

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
  d1: D1Database,
  userId: string,
  balance: Partial<Record<Currency, number>>,
): Promise<Record<Currency, number>> => {
  const current = await getFinanceBalance(d1, userId)
  const merged: Record<Currency, number> = {
    RUB: balance.RUB !== undefined ? balance.RUB : current.RUB,
    USD: balance.USD !== undefined ? balance.USD : current.USD,
    GEL: balance.GEL !== undefined ? balance.GEL : current.GEL,
  }

  const db = getDb(d1)
  await db
    .insert(financeBalance)
    .values({
      userId,
      rub: merged.RUB,
      usd: merged.USD,
      gel: merged.GEL,
    })
    .onConflictDoUpdate({
      target: financeBalance.userId,
      set: {
        rub: merged.RUB,
        usd: merged.USD,
        gel: merged.GEL,
      },
    })

  return merged
}

export const getFinanceRates = async (
  d1: D1Database,
  userId: string,
): Promise<{ rates: Record<Currency, number>; source: string; updatedAt: string | null }> => {
  const db = getDb(d1)
  const row = await db.select().from(financeRates).where(eq(financeRates.userId, userId)).get()

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
    updatedAt: row.updatedAt,
  }
}

export const updateFinanceRates = async (
  d1: D1Database,
  userId: string,
  rates: Partial<Record<Currency, number>>,
  source = 'manual',
): Promise<{ rates: Record<Currency, number>; source: string; updatedAt: string }> => {
  const current = await getFinanceRates(d1, userId)
  const mergedRates: Record<Currency, number> = {
    RUB: rates.RUB !== undefined ? rates.RUB : current.rates.RUB,
    USD: rates.USD !== undefined ? rates.USD : current.rates.USD,
    GEL: rates.GEL !== undefined ? rates.GEL : current.rates.GEL,
  }
  const updatedAt = new Date().toISOString()

  const db = getDb(d1)
  await db
    .insert(financeRates)
    .values({
      userId,
      rub: mergedRates.RUB,
      usd: mergedRates.USD,
      gel: mergedRates.GEL,
      source,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: financeRates.userId,
      set: {
        rub: mergedRates.RUB,
        usd: mergedRates.USD,
        gel: mergedRates.GEL,
        source,
        updatedAt,
      },
    })

  return {
    rates: mergedRates,
    source,
    updatedAt,
  }
}

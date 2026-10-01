import { and, asc, desc, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { productivityItems, productivityMonths, productivityMood } from '../schema'
import type { MoodEntry, ProductivityItem, ProductivityKind, ProductivityMonthRecord, RepeatInterval, TaskPriority } from '../../types'

export const getProductivityItems = async (
  d1: D1Database,
  userId: string,
  kind?: string,
  done?: boolean,
  limit = 200,
  offset = 0,
): Promise<ProductivityItem[]> => {
  const db = getDb(d1)
  const conditions = [eq(productivityItems.userId, userId)]

  if (kind) {
    conditions.push(eq(productivityItems.kind, kind))
  }

  if (done !== undefined) {
    conditions.push(eq(productivityItems.done, done ? 1 : 0))
  }

  const rows = await db
    .select()
    .from(productivityItems)
    .where(and(...conditions))
    .orderBy(desc(productivityItems.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as ProductivityKind,
    title: row.title,
    date: row.date,
    repeat: (row.repeat as RepeatInterval) || 'none',
    done: Boolean(row.done),
    doneAt: row.doneAt,
    priority: (row.priority as TaskPriority) || undefined,
    note: row.note || undefined,
    senderId: row.senderId || undefined,
    senderName: row.senderName || undefined,
    createdAt: row.createdAt,
  }))
}

export const createProductivityItem = async (
  d1: D1Database,
  userId: string,
  item: Omit<ProductivityItem, 'id' | 'createdAt'>,
): Promise<ProductivityItem> => {
  const db = getDb(d1)
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const repeat = item.repeat || 'none'
  const done = item.done ? 1 : 0
  const priority = item.priority || null
  const note = item.note || ''
  const senderId = item.senderId ?? null
  const senderName = item.senderName ?? null

  await db.insert(productivityItems).values({
    id,
    userId,
    kind: item.kind,
    title: item.title,
    date: item.date || '',
    repeat,
    done,
    doneAt: item.doneAt ?? null,
    priority,
    note,
    senderId,
    senderName,
    createdAt,
  })

  return {
    id,
    kind: item.kind,
    title: item.title,
    date: item.date || '',
    repeat: item.repeat || 'none',
    done: Boolean(item.done),
    doneAt: item.doneAt ?? null,
    priority: item.priority,
    note: item.note,
    senderId: item.senderId,
    senderName: item.senderName,
    createdAt,
  }
}

export const updateProductivityItem = async (
  d1: D1Database,
  userId: string,
  id: string,
  patch: Partial<ProductivityItem>,
): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(productivityItems)
    .where(and(eq(productivityItems.id, id), eq(productivityItems.userId, userId)))
    .get()

  if (!existing) return false

  await db
    .update(productivityItems)
    .set({
      kind: patch.kind ?? existing.kind,
      title: patch.title ?? existing.title,
      date: patch.date !== undefined ? patch.date : existing.date,
      repeat: patch.repeat !== undefined ? patch.repeat : existing.repeat,
      done: patch.done !== undefined ? (patch.done ? 1 : 0) : existing.done,
      doneAt: patch.doneAt !== undefined ? patch.doneAt : existing.doneAt,
      priority: patch.priority !== undefined ? patch.priority : existing.priority,
      note: patch.note !== undefined ? patch.note : existing.note,
    })
    .where(and(eq(productivityItems.id, id), eq(productivityItems.userId, userId)))

  return true
}

export const deleteProductivityItem = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(productivityItems).where(and(eq(productivityItems.id, id), eq(productivityItems.userId, userId)))
  return (res.meta.changes ?? 0) > 0
}

export const getProductivityMonths = async (d1: D1Database, userId: string): Promise<Record<string, ProductivityMonthRecord>> => {
  const db = getDb(d1)
  const rows = await db.select().from(productivityMonths).where(eq(productivityMonths.userId, userId))

  const months: Record<string, ProductivityMonthRecord> = {}
  for (const row of rows) {
    months[row.monthKey] = {
      points: row.points,
      counts: {
        task: row.taskCount,
        goal: row.goalCount,
        dream: row.dreamCount,
      },
    }
  }
  return months
}

export const setProductivityMonths = async (
  d1: D1Database,
  userId: string,
  months: Record<string, ProductivityMonthRecord>,
): Promise<void> => {
  const db = getDb(d1)
  await db.delete(productivityMonths).where(eq(productivityMonths.userId, userId))

  const entries = Object.entries(months)
  if (entries.length > 0) {
    await db.insert(productivityMonths).values(
      entries.map(([key, record]) => ({
        userId,
        monthKey: key,
        points: record.points || 0,
        taskCount: record.counts?.task || 0,
        goalCount: record.counts?.goal || 0,
        dreamCount: record.counts?.dream || 0,
      })),
    )
  }
}

export const getProductivityMood = async (d1: D1Database, userId: string): Promise<Record<string, MoodEntry>> => {
  const db = getDb(d1)
  const rows = await db
    .select({ date: productivityMood.date, level: productivityMood.level, note: productivityMood.note })
    .from(productivityMood)
    .where(eq(productivityMood.userId, userId))
    .orderBy(asc(productivityMood.date))

  const moodMap: Record<string, MoodEntry> = {}
  for (const row of rows) {
    moodMap[row.date] = {
      level: row.level,
      note: row.note || undefined,
    }
  }
  return moodMap
}

export const setProductivityMood = async (d1: D1Database, userId: string, date: string, level: number, note = ''): Promise<void> => {
  const db = getDb(d1)
  await db
    .insert(productivityMood)
    .values({ userId, date, level, note })
    .onConflictDoUpdate({
      target: [productivityMood.userId, productivityMood.date],
      set: { level, note },
    })
}

export const deleteProductivityMood = async (d1: D1Database, userId: string, date: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(productivityMood).where(and(eq(productivityMood.userId, userId), eq(productivityMood.date, date)))
  return (res.meta.changes ?? 0) > 0
}

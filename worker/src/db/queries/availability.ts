import { and, asc, eq, inArray, or } from 'drizzle-orm'
import { getDb } from '../client'
import { availabilityWindows, friendships, users } from '../schema'
import { MINUTES_IN_DAY, type AvailabilityScope, type AvailabilityWindow, type FriendAvailability } from '../../types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const normalizeScope = (input: {
  scope?: AvailabilityScope
  dayOfWeek?: number | null
  date?: string | null
}): { scope: AvailabilityScope; dayOfWeek: number | null; date: string | null } | null => {
  const cleanDate = typeof input.date === 'string' && DATE_PATTERN.test(input.date.trim()) ? input.date.trim() : null

  if (input.scope === 'date') {
    return cleanDate ? { scope: 'date', dayOfWeek: null, date: cleanDate } : null
  }

  const day = typeof input.dayOfWeek === 'number' && input.dayOfWeek >= 0 && input.dayOfWeek <= 6 ? input.dayOfWeek : null

  if (day === null) {
    return cleanDate ? { scope: 'date', dayOfWeek: null, date: cleanDate } : null
  }

  return { scope: 'weekly', dayOfWeek: day, date: null }
}

const toWindow = (row: typeof availabilityWindows.$inferSelect): AvailabilityWindow => ({
  id: row.id,
  userId: row.userId,
  scope: (row.scope as AvailabilityScope) || 'weekly',
  dayOfWeek: row.dayOfWeek ?? null,
  date: row.date ?? null,
  startMin: row.startMin,
  endMin: row.endMin,
  note: row.note || '',
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const sortWindows = (windows: AvailabilityWindow[]): AvailabilityWindow[] =>
  [...windows].sort((a, b) => {
    if (a.scope !== b.scope) return a.scope === 'date' ? -1 : 1
    if (a.scope === 'date') return (a.date || '').localeCompare(b.date || '') || a.startMin - b.startMin
    return (a.dayOfWeek ?? 7) - (b.dayOfWeek ?? 7) || a.startMin - b.startMin
  })

export const getAvailabilityWindows = async (d1: D1Database, userId: string): Promise<AvailabilityWindow[]> => {
  const db = getDb(d1)
  const rows = await db.select().from(availabilityWindows).where(eq(availabilityWindows.userId, userId))

  return sortWindows(rows.map(toWindow))
}

export const getFriendsAvailability = async (d1: D1Database, userId: string): Promise<FriendAvailability[]> => {
  const db = getDb(d1)

  const accepted = await db
    .select({ userId: friendships.userId, friendId: friendships.friendId })
    .from(friendships)
    .where(and(or(eq(friendships.userId, userId), eq(friendships.friendId, userId)), eq(friendships.status, 'accepted')))

  const friendIds = [...new Set(accepted.map((row) => (row.userId === userId ? row.friendId : row.userId)))]

  if (friendIds.length === 0) return []

  const [userRows, windowRows] = await Promise.all([
    db.select({ id: users.id, email: users.email }).from(users).where(inArray(users.id, friendIds)).orderBy(asc(users.email)),
    db.select().from(availabilityWindows).where(inArray(availabilityWindows.userId, friendIds)),
  ])

  const windowsByUser = new Map<string, AvailabilityWindow[]>()
  for (const row of windowRows) {
    const list = windowsByUser.get(row.userId) ?? []
    list.push(toWindow(row))
    windowsByUser.set(row.userId, list)
  }

  return userRows.map((user) => ({
    friendId: user.id,
    email: user.email,
    windows: sortWindows(windowsByUser.get(user.id) ?? []),
  }))
}

export const createAvailabilityWindow = async (
  d1: D1Database,
  userId: string,
  input: { scope?: AvailabilityScope; dayOfWeek?: number | null; date?: string | null; startMin: number; endMin: number; note?: string },
): Promise<AvailabilityWindow | null> => {
  const db = getDb(d1)
  const normalized = normalizeScope(input)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const startMin = Math.min(Math.max(Math.trunc(input.startMin), 0), MINUTES_IN_DAY - 1)
  const endMin = Math.min(Math.max(Math.trunc(input.endMin), 1), MINUTES_IN_DAY)
  if (endMin <= startMin || !normalized) return null

  const row: typeof availabilityWindows.$inferSelect = {
    id,
    userId,
    scope: normalized.scope,
    dayOfWeek: normalized.dayOfWeek,
    date: normalized.date,
    startMin,
    endMin,
    note: input.note || '',
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(availabilityWindows).values(row)

  return toWindow(row)
}

export type UpdateAvailabilityResult = { status: 'ok'; window: AvailabilityWindow } | { status: 'invalid' } | { status: 'not_found' }

export const updateAvailabilityWindow = async (
  d1: D1Database,
  userId: string,
  id: string,
  patch: { scope?: AvailabilityScope; dayOfWeek?: number | null; date?: string | null; startMin?: number; endMin?: number; note?: string },
): Promise<UpdateAvailabilityResult> => {
  const db = getDb(d1)

  const existing = await db
    .select()
    .from(availabilityWindows)
    .where(and(eq(availabilityWindows.id, id), eq(availabilityWindows.userId, userId)))
    .get()

  if (!existing) return { status: 'not_found' }

  const merged = normalizeScope({
    scope: patch.scope ?? (existing.scope as AvailabilityScope),
    dayOfWeek: patch.dayOfWeek !== undefined ? patch.dayOfWeek : existing.dayOfWeek,
    date: patch.date !== undefined ? patch.date : existing.date,
  })

  if (!merged) return { status: 'invalid' }

  const startMin = patch.startMin ?? existing.startMin
  const endMin = patch.endMin ?? existing.endMin

  if (endMin <= startMin) return { status: 'invalid' }

  const row = {
    scope: merged.scope,
    dayOfWeek: merged.dayOfWeek,
    date: merged.date,
    startMin,
    endMin,
    note: patch.note !== undefined ? patch.note : existing.note,
    updatedAt: new Date().toISOString(),
  }

  await db.update(availabilityWindows).set(row).where(eq(availabilityWindows.id, id))

  return { status: 'ok', window: toWindow({ ...existing, ...row }) }
}

export const deleteAvailabilityWindow = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db
    .delete(availabilityWindows)
    .where(and(eq(availabilityWindows.id, id), eq(availabilityWindows.userId, userId)))
    .run()

  return (res.meta.changes ?? 0) > 0
}

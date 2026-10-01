import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { birthdays, ownBirthday } from '../schema'
import type { Birthday } from '../../types'

export const getBirthdays = async (d1: D1Database, userId: string): Promise<{ ownBirthday: string; birthdays: Birthday[] }> => {
  const db = getDb(d1)
  const ownRow = await db.select({ date: ownBirthday.date }).from(ownBirthday).where(eq(ownBirthday.userId, userId)).get()
  const rows = await db
    .select({ id: birthdays.id, name: birthdays.name, date: birthdays.date })
    .from(birthdays)
    .where(eq(birthdays.userId, userId))
    .orderBy(asc(birthdays.date))

  return {
    ownBirthday: ownRow?.date || '',
    birthdays: rows,
  }
}

export const createBirthday = async (d1: D1Database, userId: string, name: string, date: string): Promise<Birthday> => {
  const db = getDb(d1)
  const id = crypto.randomUUID()
  await db.insert(birthdays).values({ id, userId, name, date })
  return { id, name, date }
}

export const deleteBirthday = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(birthdays).where(and(eq(birthdays.id, id), eq(birthdays.userId, userId)))
  return (res.meta.changes ?? 0) > 0
}

export const setOwnBirthday = async (d1: D1Database, userId: string, date: string): Promise<string> => {
  const db = getDb(d1)
  await db.insert(ownBirthday).values({ userId, date }).onConflictDoUpdate({ target: ownBirthday.userId, set: { date } })
  return date
}

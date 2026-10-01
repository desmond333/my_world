import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const getD1 = (db: D1Database): D1Database => db

export const getDb = (d1: D1Database) => drizzle(d1, { schema })
export type AppDb = ReturnType<typeof getDb>
export { schema }

export const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const safeLimit = (val: string | undefined, defaultVal = 50, maxVal = 200): number => {
  const parsed = Number(val)
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultVal
  return Math.min(Math.floor(parsed), maxVal)
}

export const safeOffset = (val: string | undefined): number => {
  const parsed = Number(val)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.floor(parsed)
}

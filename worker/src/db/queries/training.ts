import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { trainingDays, trainingSports } from '../schema'
import type { TrainingSport } from '../../types'

export const getTrainingDays = async (d1: D1Database, userId: string, from?: string, to?: string): Promise<Record<string, string[]>> => {
  const db = getDb(d1)
  const conditions = [eq(trainingDays.userId, userId)]
  if (from) conditions.push(gte(trainingDays.date, from))
  if (to) conditions.push(lte(trainingDays.date, to))

  const rows = await db
    .select({ date: trainingDays.date, sportsJson: trainingDays.sportsJson })
    .from(trainingDays)
    .where(and(...conditions))
    .orderBy(asc(trainingDays.date))

  const map: Record<string, string[]> = {}
  for (const row of rows) {
    map[row.date] = parseJson<string[]>(row.sportsJson, [])
  }
  return map
}

export const setTrainingDay = async (d1: D1Database, userId: string, date: string, sports: string[]): Promise<void> => {
  const db = getDb(d1)
  const id = `${userId}_${date}`
  await db
    .insert(trainingDays)
    .values({ id, userId, date, sportsJson: JSON.stringify(sports) })
    .onConflictDoUpdate({
      target: [trainingDays.userId, trainingDays.date],
      set: { sportsJson: JSON.stringify(sports) },
    })
}

export const deleteTrainingDay = async (d1: D1Database, userId: string, date: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(trainingDays).where(and(eq(trainingDays.userId, userId), eq(trainingDays.date, date)))
  return (res.meta.changes ?? 0) > 0
}

export const getTrainingSports = async (d1: D1Database, userId: string): Promise<TrainingSport[]> => {
  const db = getDb(d1)
  const rows = await db
    .select()
    .from(trainingSports)
    .where(eq(trainingSports.userId, userId))
    .orderBy(asc(trainingSports.sortOrder), asc(trainingSports.label))

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    color: row.color,
    enabled: Boolean(row.enabled),
    custom: Boolean(row.custom),
    sortOrder: row.sortOrder,
  }))
}

export const createTrainingSport = async (d1: D1Database, userId: string, sport: TrainingSport): Promise<TrainingSport> => {
  const db = getDb(d1)
  const id = sport.id || crypto.randomUUID()
  const sortOrder = sport.sortOrder ?? 0

  await db.insert(trainingSports).values({
    id,
    userId,
    label: sport.label,
    color: sport.color,
    enabled: sport.enabled ? 1 : 0,
    custom: sport.custom ? 1 : 0,
    sortOrder,
  })

  return { ...sport, id, sortOrder }
}

export const updateTrainingSport = async (d1: D1Database, userId: string, id: string, patch: Partial<TrainingSport>): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(trainingSports)
    .where(and(eq(trainingSports.id, id), eq(trainingSports.userId, userId)))
    .get()

  if (!existing) return false

  const label = patch.label ?? existing.label
  const color = patch.color ?? existing.color
  const enabled = patch.enabled !== undefined ? (patch.enabled ? 1 : 0) : existing.enabled
  const custom = patch.custom !== undefined ? (patch.custom ? 1 : 0) : existing.custom
  const sortOrder = patch.sortOrder !== undefined ? patch.sortOrder : existing.sortOrder

  await db
    .update(trainingSports)
    .set({ label, color, enabled, custom, sortOrder })
    .where(and(eq(trainingSports.id, id), eq(trainingSports.userId, userId)))

  return true
}

export const deleteTrainingSport = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db.delete(trainingSports).where(and(eq(trainingSports.id, id), eq(trainingSports.userId, userId)))
  return (res.meta.changes ?? 0) > 0
}

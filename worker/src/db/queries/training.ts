import { parseJson } from '../client'
import type { TrainingSport } from '../../types'

type TrainingDayRow = {
  date: string
  sports_json: string
}

type TrainingSportRow = {
  id: string
  label: string
  color: string
  enabled: number
  custom: number
  sort_order: number
}

export const getTrainingDays = async (db: D1Database, userId: string, from?: string, to?: string): Promise<Record<string, string[]>> => {
  let query = 'SELECT date, sports_json FROM training_days WHERE user_id = ?'
  const params: unknown[] = [userId]

  if (from && to) {
    query += ' AND date >= ? AND date <= ?'
    params.push(from, to)
  } else if (from) {
    query += ' AND date >= ?'
    params.push(from)
  } else if (to) {
    query += ' AND date <= ?'
    params.push(to)
  }

  query += ' ORDER BY date ASC'

  const { results } = await db
    .prepare(query)
    .bind(...params)
    .all<TrainingDayRow>()

  const map: Record<string, string[]> = {}
  for (const row of results) {
    map[row.date] = parseJson<string[]>(row.sports_json, [])
  }
  return map
}

export const setTrainingDay = async (db: D1Database, userId: string, date: string, sports: string[]): Promise<void> => {
  const id = `${userId}_${date}`
  await db
    .prepare(
      `INSERT INTO training_days (id, user_id, date, sports_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, date) DO UPDATE SET sports_json = excluded.sports_json`,
    )
    .bind(id, userId, date, JSON.stringify(sports))
    .run()
}

export const deleteTrainingDay = async (db: D1Database, userId: string, date: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM training_days WHERE user_id = ? AND date = ?').bind(userId, date).run()
  return (res.meta.changes ?? 0) > 0
}

export const getTrainingSports = async (db: D1Database, userId: string): Promise<TrainingSport[]> => {
  const { results } = await db
    .prepare('SELECT * FROM training_sports WHERE user_id = ? ORDER BY sort_order ASC, label ASC')
    .bind(userId)
    .all<TrainingSportRow>()

  return results.map((row) => ({
    id: row.id,
    label: row.label,
    color: row.color,
    enabled: Boolean(row.enabled),
    custom: Boolean(row.custom),
    sortOrder: row.sort_order,
  }))
}

export const createTrainingSport = async (db: D1Database, userId: string, sport: TrainingSport): Promise<TrainingSport> => {
  const id = sport.id || crypto.randomUUID()
  const sortOrder = sport.sortOrder ?? 0

  await db
    .prepare(
      `INSERT INTO training_sports (id, user_id, label, color, enabled, custom, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, sport.label, sport.color, sport.enabled ? 1 : 0, sport.custom ? 1 : 0, sortOrder)
    .run()

  return { ...sport, id, sortOrder }
}

export const updateTrainingSport = async (db: D1Database, userId: string, id: string, patch: Partial<TrainingSport>): Promise<boolean> => {
  const existing = await db.prepare('SELECT * FROM training_sports WHERE id = ? AND user_id = ?').bind(id, userId).first<TrainingSportRow>()

  if (!existing) return false

  const label = patch.label ?? existing.label
  const color = patch.color ?? existing.color
  const enabled = patch.enabled !== undefined ? (patch.enabled ? 1 : 0) : existing.enabled
  const custom = patch.custom !== undefined ? (patch.custom ? 1 : 0) : existing.custom
  const sortOrder = patch.sortOrder !== undefined ? patch.sortOrder : existing.sort_order

  await db
    .prepare(
      `UPDATE training_sports
       SET label = ?, color = ?, enabled = ?, custom = ?, sort_order = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(label, color, enabled, custom, sortOrder, id, userId)
    .run()

  return true
}

export const deleteTrainingSport = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM training_sports WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

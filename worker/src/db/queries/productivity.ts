import type { MoodEntry, ProductivityItem, ProductivityKind, ProductivityMonthRecord, RepeatInterval, TaskPriority } from '../../types'

type ProductivityItemRow = {
  id: string
  user_id: string
  kind: string
  title: string
  date: string
  repeat: string
  done: number
  done_at: string | null
  priority: string | null
  note: string
  sender_id: string | null
  sender_name: string | null
  created_at: string
}

type ProductivityMonthRow = {
  month_key: string
  points: number
  task_count: number
  goal_count: number
  dream_count: number
}

type MoodRow = {
  date: string
  level: number
  note: string
}

export const getProductivityItems = async (
  db: D1Database,
  userId: string,
  kind?: string,
  done?: boolean,
  limit = 200,
  offset = 0,
): Promise<ProductivityItem[]> => {
  let query = 'SELECT * FROM productivity_items WHERE user_id = ?'
  const params: unknown[] = [userId]

  if (kind) {
    query += ' AND kind = ?'
    params.push(kind)
  }

  if (done !== undefined) {
    query += ' AND done = ?'
    params.push(done ? 1 : 0)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await db
    .prepare(query)
    .bind(...params)
    .all<ProductivityItemRow>()

  return results.map((row) => ({
    id: row.id,
    kind: row.kind as ProductivityKind,
    title: row.title,
    date: row.date,
    repeat: (row.repeat as RepeatInterval) || 'none',
    done: Boolean(row.done),
    doneAt: row.done_at,
    priority: (row.priority as TaskPriority) || undefined,
    note: row.note || undefined,
    senderId: row.sender_id || undefined,
    senderName: row.sender_name || undefined,
    createdAt: row.created_at,
  }))
}

export const createProductivityItem = async (
  db: D1Database,
  userId: string,
  item: Omit<ProductivityItem, 'id' | 'createdAt'>,
): Promise<ProductivityItem> => {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const repeat = item.repeat || 'none'
  const done = item.done ? 1 : 0
  const priority = item.priority || null
  const note = item.note || ''
  const senderId = item.senderId ?? null
  const senderName = item.senderName ?? null

  await db
    .prepare(
      `INSERT INTO productivity_items (id, user_id, kind, title, date, repeat, done, done_at, priority, note, sender_id, sender_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      userId,
      item.kind,
      item.title,
      item.date || '',
      repeat,
      done,
      item.doneAt ?? null,
      priority,
      note,
      senderId,
      senderName,
      createdAt,
    )
    .run()

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
  db: D1Database,
  userId: string,
  id: string,
  patch: Partial<ProductivityItem>,
): Promise<boolean> => {
  const existing = await db
    .prepare('SELECT * FROM productivity_items WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<ProductivityItemRow>()

  if (!existing) return false

  const kind = patch.kind ?? existing.kind
  const title = patch.title ?? existing.title
  const date = patch.date !== undefined ? patch.date : existing.date
  const repeat = patch.repeat !== undefined ? patch.repeat : existing.repeat
  const done = patch.done !== undefined ? (patch.done ? 1 : 0) : existing.done
  const doneAt = patch.doneAt !== undefined ? patch.doneAt : existing.done_at
  const priority = patch.priority !== undefined ? patch.priority : existing.priority
  const note = patch.note !== undefined ? patch.note : existing.note

  await db
    .prepare(
      `UPDATE productivity_items
       SET kind = ?, title = ?, date = ?, repeat = ?, done = ?, done_at = ?, priority = ?, note = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(kind, title, date, repeat, done, doneAt, priority, note, id, userId)
    .run()

  return true
}

export const deleteProductivityItem = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM productivity_items WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

export const getProductivityMonths = async (db: D1Database, userId: string): Promise<Record<string, ProductivityMonthRecord>> => {
  const { results } = await db.prepare('SELECT * FROM productivity_months WHERE user_id = ?').bind(userId).all<ProductivityMonthRow>()

  const months: Record<string, ProductivityMonthRecord> = {}
  for (const row of results) {
    months[row.month_key] = {
      points: row.points,
      counts: {
        task: row.task_count,
        goal: row.goal_count,
        dream: row.dream_count,
      },
    }
  }
  return months
}

export const setProductivityMonths = async (
  db: D1Database,
  userId: string,
  months: Record<string, ProductivityMonthRecord>,
): Promise<void> => {
  const statements: D1PreparedStatement[] = [db.prepare('DELETE FROM productivity_months WHERE user_id = ?').bind(userId)]

  for (const [key, record] of Object.entries(months)) {
    statements.push(
      db
        .prepare(
          `INSERT INTO productivity_months (user_id, month_key, points, task_count, goal_count, dream_count)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(userId, key, record.points || 0, record.counts?.task || 0, record.counts?.goal || 0, record.counts?.dream || 0),
    )
  }

  await db.batch(statements)
}

export const getProductivityMood = async (db: D1Database, userId: string): Promise<Record<string, MoodEntry>> => {
  const { results } = await db
    .prepare('SELECT date, level, note FROM productivity_mood WHERE user_id = ? ORDER BY date ASC')
    .bind(userId)
    .all<MoodRow>()

  const moodMap: Record<string, MoodEntry> = {}
  for (const row of results) {
    moodMap[row.date] = {
      level: row.level,
      note: row.note || undefined,
    }
  }
  return moodMap
}

export const setProductivityMood = async (db: D1Database, userId: string, date: string, level: number, note = ''): Promise<void> => {
  await db
    .prepare(
      `INSERT INTO productivity_mood (user_id, date, level, note)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, date) DO UPDATE SET
         level = excluded.level,
         note = excluded.note`,
    )
    .bind(userId, date, level, note)
    .run()
}

export const deleteProductivityMood = async (db: D1Database, userId: string, date: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM productivity_mood WHERE user_id = ? AND date = ?').bind(userId, date).run()
  return (res.meta.changes ?? 0) > 0
}

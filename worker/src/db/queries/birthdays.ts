import type { Birthday } from '../../types'

type BirthdayRow = {
  id: string
  name: string
  date: string
}

type OwnBirthdayRow = {
  date: string
}

export const getBirthdays = async (db: D1Database, userId: string): Promise<{ ownBirthday: string; birthdays: Birthday[] }> => {
  const ownRow = await db.prepare('SELECT date FROM own_birthday WHERE user_id = ?').bind(userId).first<OwnBirthdayRow>()

  const { results } = await db
    .prepare('SELECT id, name, date FROM birthdays WHERE user_id = ? ORDER BY date ASC')
    .bind(userId)
    .all<BirthdayRow>()

  return {
    ownBirthday: ownRow?.date || '',
    birthdays: results.map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date,
    })),
  }
}

export const createBirthday = async (db: D1Database, userId: string, name: string, date: string): Promise<Birthday> => {
  const id = crypto.randomUUID()
  await db.prepare('INSERT INTO birthdays (id, user_id, name, date) VALUES (?, ?, ?, ?)').bind(id, userId, name, date).run()

  return { id, name, date }
}

export const deleteBirthday = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db.prepare('DELETE FROM birthdays WHERE id = ? AND user_id = ?').bind(id, userId).run()
  return (res.meta.changes ?? 0) > 0
}

export const setOwnBirthday = async (db: D1Database, userId: string, date: string): Promise<string> => {
  await db
    .prepare(
      `INSERT INTO own_birthday (user_id, date)
       VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET date = excluded.date`,
    )
    .bind(userId, date)
    .run()

  return date
}

import { desc, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { contactMessages } from '../schema'
import type { ContactMessage } from '../../types'

const MAX_BODY = 4000

export const createContactMessage = async (
  d1: D1Database,
  input: { userId: string | null; email: string; topic: string; body: string },
): Promise<ContactMessage> => {
  const db = getDb(d1)
  const record: ContactMessage = {
    id: crypto.randomUUID(),
    userId: input.userId,
    email: input.email.slice(0, 254),
    topic: input.topic,
    body: input.body.slice(0, MAX_BODY),
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  await db.insert(contactMessages).values(record)
  return record
}

export const listContactMessages = async (d1: D1Database, limit = 100): Promise<ContactMessage[]> => {
  const db = getDb(d1)
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(Math.min(limit, 200)).all()
}

export const setContactMessageStatus = async (d1: D1Database, id: string, status: string): Promise<boolean> => {
  const db = getDb(d1)
  const result = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id))
  return Boolean(result.meta.changes)
}

export const deleteContactMessage = async (d1: D1Database, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const result = await db.delete(contactMessages).where(eq(contactMessages.id, id))
  return Boolean(result.meta.changes)
}

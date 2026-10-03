import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { users } from '../db/schema'
import { createContactMessage } from '../db/queries/contact'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import { CONTACT_TOPICS, type Env } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 })

export const contactRouter = new Hono<{ Bindings: Env }>().use('*', authMiddleware, contactLimiter).post('/', async (c) => {
  const userId = c.get('user').userId
  const payload = await c.req.json<{ body?: unknown; topic?: unknown; email?: unknown }>().catch(() => ({}) as Record<string, unknown>)

  const body = typeof payload.body === 'string' ? payload.body.trim() : ''
  if (body.length < 5 || body.length > 4000) {
    return c.json({ error: 'body must be between 5 and 4000 characters', code: 'INVALID_INPUT' }, 400)
  }

  const topic =
    typeof payload.topic === 'string' && (CONTACT_TOPICS as readonly string[]).includes(payload.topic) ? payload.topic : 'support'

  const appDb = getDb(c.env.DB)
  const account = await appDb.select({ email: users.email }).from(users).where(eq(users.id, userId)).get()
  const fallbackEmail = typeof payload.email === 'string' ? payload.email.trim().slice(0, 254) : ''
  const email = account?.email || (EMAIL_PATTERN.test(fallbackEmail) ? fallbackEmail : '')

  if (!email) {
    return c.json({ error: 'A valid email is required', code: 'INVALID_EMAIL' }, 400)
  }

  const message = await createContactMessage(c.env.DB, {
    userId,
    email,
    topic,
    body,
  })

  return c.json({ ok: true, id: message.id })
})

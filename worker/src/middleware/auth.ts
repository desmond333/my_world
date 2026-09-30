import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt'
import type { Env } from '../types'

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  const token = authHeader.slice(7).trim()
  const secret = c.env.JWT_SECRET || 'fallback-secret-key-replace-in-production'
  const user = await verifyAccessToken(token, secret)

  if (!user) {
    return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401)
  }

  c.set('user', user)
  await next()
}

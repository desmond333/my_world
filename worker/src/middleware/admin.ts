import type { Context, Next } from 'hono'
import type { Env } from '../types'

export const adminMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403)
  }
  await next()
}

import { Hono } from 'hono'
import { getSyncSnapshot } from '../db/queries/sync'
import { adminMiddleware } from '../middleware/admin'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../types'

type AdminUserRow = {
  id: string
  email: string
  role: string
  created_at: string
}

export const adminRouter = new Hono<{ Bindings: Env }>()

adminRouter.use('*', authMiddleware, adminMiddleware)

adminRouter.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC').all<AdminUserRow>()

  return c.json(results)
})

adminRouter.get('/users/:userId', async (c) => {
  const targetId = c.req.param('userId')
  const user = await c.env.DB.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').bind(targetId).first<AdminUserRow>()

  if (!user) {
    return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json(user)
})

adminRouter.get('/users/:userId/sync', async (c) => {
  const targetId = c.req.param('userId')
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetId).first<{ id: string }>()

  if (!user) {
    return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404)
  }

  const snapshot = await getSyncSnapshot(c.env.DB, targetId)
  return c.json(snapshot)
})

adminRouter.delete('/users/:userId', async (c) => {
  const targetId = c.req.param('userId')

  const tables = [
    'refresh_tokens',
    'settings',
    'training_days',
    'training_sports',
    'finance_entries',
    'finance_balance',
    'finance_rates',
    'productivity_items',
    'productivity_months',
    'productivity_mood',
    'subscriptions',
    'birthdays',
    'own_birthday',
    'collection_items',
    'favorites',
    'lottery_stats',
    'notes',
    'shop_state',
    'view_modes',
    'users',
  ]

  const statements = tables.map((tbl) =>
    c.env.DB.prepare(`DELETE FROM ${tbl} WHERE ${tbl === 'users' ? 'id' : 'user_id'} = ?`).bind(targetId),
  )

  statements.unshift(c.env.DB.prepare('DELETE FROM friendships WHERE user_id = ? OR friend_id = ?').bind(targetId, targetId))

  await c.env.DB.batch(statements)

  return c.json({ success: true })
})

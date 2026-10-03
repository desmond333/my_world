import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { users } from '../db/schema'
import {
  acceptFriendRequest,
  assignTaskToFriend,
  declineFriendRequest,
  getFriendsData,
  getSentFriendTasks,
  removeFriend,
  searchUsers,
  sendFriendRequest,
} from '../db/queries/friends'
import { assignFriendTaskSchema, friendRequestSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import type { Env, TaskPriority } from '../types'

export const friendsRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('user').userId
    const data = await getFriendsData(c.env.DB, userId)
    return c.json(data)
  })
  .get('/search', async (c) => {
    const userId = c.get('user').userId
    const q = c.req.query('q') || ''
    const results = await searchUsers(c.env.DB, userId, q)
    return c.json({ results })
  })
  .post(
    '/request',
    vValidator('json', friendRequestSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Email or user ID is required', issues: result.issues }, 400)
      }
    }),
    async (c) => {
      const userId = c.get('user').userId
      const body = c.req.valid('json')
      const target = (body.email || body.friendId || '').trim()

      if (!target) {
        return c.json({ error: 'Email or user ID is required', code: 'INVALID_DATA' }, 400)
      }

      const res = await sendFriendRequest(c.env.DB, userId, target)
      if (!res.success) {
        const status = res.error === 'USER_NOT_FOUND' ? 404 : res.error === 'ALREADY_FRIENDS' ? 409 : 400
        return c.json({ error: res.error, code: res.error }, status)
      }

      return c.json(res, 201)
    },
  )
  .post('/accept/:id', async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const success = await acceptFriendRequest(c.env.DB, userId, id)

    if (!success) {
      return c.json({ error: 'Request not found or not authorized', code: 'NOT_FOUND' }, 404)
    }

    return c.json({ success: true })
  })
  .post('/decline/:id', async (c) => {
    const userId = c.get('user').userId
    const id = c.req.param('id')
    const success = await declineFriendRequest(c.env.DB, userId, id)

    if (!success) {
      return c.json({ error: 'Request not found or not authorized', code: 'NOT_FOUND' }, 404)
    }

    return c.json({ success: true })
  })
  .delete('/:friendId', async (c) => {
    const userId = c.get('user').userId
    const friendId = c.req.param('friendId')
    const success = await removeFriend(c.env.DB, userId, friendId)

    if (!success) {
      return c.json({ error: 'Friendship not found', code: 'NOT_FOUND' }, 404)
    }

    return c.json({ success: true })
  })
  .post(
    '/tasks',
    vValidator('json', assignFriendTaskSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Friend ID and title are required', issues: result.issues }, 400)
      }
    }),
    async (c) => {
      const userId = c.get('user').userId
      const body = c.req.valid('json')

      const appDb = getDb(c.env.DB)
      const currentUser = await appDb.select({ email: users.email }).from(users).where(eq(users.id, userId)).get()
      const currentUserEmail = currentUser?.email || 'Unknown'

      const res = await assignTaskToFriend(c.env.DB, userId, currentUserEmail, body.friendId, {
        title: body.title,
        date: body.date,
        priority: body.priority as TaskPriority,
        note: body.note,
      })

      if (!res.success) {
        const status = res.error === 'FRIEND_TASKS_DISABLED' ? 403 : res.error === 'NOT_FRIENDS' ? 403 : 400
        return c.json({ error: res.error, code: res.error }, status)
      }

      return c.json(res, 201)
    },
  )
  .get('/tasks/sent', async (c) => {
    const userId = c.get('user').userId
    const tasks = await getSentFriendTasks(c.env.DB, userId)
    return c.json({ tasks })
  })

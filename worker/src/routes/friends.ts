import { Hono } from 'hono'
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
import { authMiddleware } from '../middleware/auth'
import type { Env, TaskPriority } from '../types'

export const friendsRouter = new Hono<{ Bindings: Env }>()

friendsRouter.use('*', authMiddleware)

friendsRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const data = await getFriendsData(c.env.DB, userId)
  return c.json(data)
})

friendsRouter.get('/search', async (c) => {
  const userId = c.get('user').userId
  const q = c.req.query('q') || ''
  const results = await searchUsers(c.env.DB, userId, q)
  return c.json({ results })
})

friendsRouter.post('/request', async (c) => {
  const userId = c.get('user').userId
  const body = (await c.req.json().catch(() => ({}))) as { email?: string; friendId?: string }
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
})

friendsRouter.post('/accept/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const success = await acceptFriendRequest(c.env.DB, userId, id)

  if (!success) {
    return c.json({ error: 'Request not found or not authorized', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

friendsRouter.post('/decline/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const success = await declineFriendRequest(c.env.DB, userId, id)

  if (!success) {
    return c.json({ error: 'Request not found or not authorized', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

friendsRouter.delete('/:friendId', async (c) => {
  const userId = c.get('user').userId
  const friendId = c.req.param('friendId')
  const success = await removeFriend(c.env.DB, userId, friendId)

  if (!success) {
    return c.json({ error: 'Friendship not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

friendsRouter.post('/tasks', async (c) => {
  const userId = c.get('user').userId
  const body = (await c.req.json().catch(() => ({}))) as {
    friendId?: string
    title?: string
    date?: string
    priority?: TaskPriority
    note?: string
  }

  if (!body.friendId || !body.title) {
    return c.json({ error: 'Friend ID and title are required', code: 'INVALID_DATA' }, 400)
  }

  const currentUser = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(userId).first<{ email: string }>()
  const currentUserEmail = currentUser?.email || 'Unknown'

  const res = await assignTaskToFriend(c.env.DB, userId, currentUserEmail, body.friendId, {
    title: body.title,
    date: body.date,
    priority: body.priority,
    note: body.note,
  })

  if (!res.success) {
    const status = res.error === 'FRIEND_TASKS_DISABLED' ? 403 : res.error === 'NOT_FRIENDS' ? 403 : 400
    return c.json({ error: res.error, code: res.error }, status)
  }

  return c.json(res, 201)
})

friendsRouter.get('/tasks/sent', async (c) => {
  const userId = c.get('user').userId
  const tasks = await getSentFriendTasks(c.env.DB, userId)
  return c.json({ tasks })
})

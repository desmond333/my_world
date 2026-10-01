import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
import {
  createAvailabilityWindow,
  deleteAvailabilityWindow,
  getAvailabilityWindows,
  getFriendsAvailability,
  updateAvailabilityWindow,
} from '../db/queries/availability'
import { createAvailabilityWindowSchema, updateAvailabilityWindowSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import type { AvailabilityScope, Env } from '../types'

export const availabilityRouter = new Hono<{ Bindings: Env }>()

availabilityRouter.use('*', authMiddleware)

availabilityRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const windows = await getAvailabilityWindows(c.env.DB, userId)
  return c.json({ windows })
})

availabilityRouter.get('/friends', async (c) => {
  const userId = c.get('user').userId
  const friends = await getFriendsAvailability(c.env.DB, userId)
  return c.json({ friends })
})

availabilityRouter.post(
  '/',
  vValidator('json', createAvailabilityWindowSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid availability window', code: 'INVALID_INPUT', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const userId = c.get('user').userId
    const body = c.req.valid('json')

    const window = await createAvailabilityWindow(c.env.DB, userId, {
      scope: body.scope as AvailabilityScope | undefined,
      dayOfWeek: body.dayOfWeek,
      date: body.date,
      startMin: body.startMin,
      endMin: body.endMin,
      note: body.note,
    })

    if (!window) {
      return c.json({ error: 'Invalid availability window', code: 'INVALID_INPUT' }, 400)
    }

    return c.json({ window }, 201)
  },
)

availabilityRouter.put(
  '/:id',
  vValidator('json', updateAvailabilityWindowSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid availability window', code: 'INVALID_INPUT', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const userId = c.get('user').userId
    const body = c.req.valid('json')
    const id = c.req.param('id')

    const result = await updateAvailabilityWindow(c.env.DB, userId, id, {
      scope: body.scope as AvailabilityScope | undefined,
      dayOfWeek: body.dayOfWeek,
      date: body.date,
      startMin: body.startMin,
      endMin: body.endMin,
      note: body.note,
    })

    if (result.status === 'not_found') {
      return c.json({ error: 'Availability window not found', code: 'NOT_FOUND' }, 404)
    }

    if (result.status === 'invalid') {
      return c.json({ error: 'Invalid availability window', code: 'INVALID_INPUT' }, 400)
    }

    return c.json({ window: result.window })
  },
)

availabilityRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const success = await deleteAvailabilityWindow(c.env.DB, userId, id)

  if (!success) {
    return c.json({ error: 'Availability window not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

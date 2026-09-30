import { Hono } from 'hono'
import {
  createTrainingSport,
  deleteTrainingDay,
  deleteTrainingSport,
  getTrainingDays,
  getTrainingSports,
  setTrainingDay,
  updateTrainingSport,
} from '../db/queries/training'
import { authMiddleware } from '../middleware/auth'
import type { Env, TrainingSport } from '../types'

export const trainingRouter = new Hono<{ Bindings: Env }>()

trainingRouter.use('*', authMiddleware)

trainingRouter.get('/days', async (c) => {
  const userId = c.get('user').userId
  const from = c.req.query('from')
  const to = c.req.query('to')
  const days = await getTrainingDays(c.env.DB, userId, from, to)
  return c.json(days)
})

trainingRouter.put('/days/:date', async (c) => {
  const userId = c.get('user').userId
  const date = c.req.param('date')
  const body = (await c.req.json().catch(() => ({}))) as { sports?: string[] }
  await setTrainingDay(c.env.DB, userId, date, body.sports || [])
  return c.json({ success: true, date, sports: body.sports || [] })
})

trainingRouter.delete('/days/:date', async (c) => {
  const userId = c.get('user').userId
  const date = c.req.param('date')
  const deleted = await deleteTrainingDay(c.env.DB, userId, date)
  if (!deleted) {
    return c.json({ error: 'Day record not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

trainingRouter.get('/sports', async (c) => {
  const userId = c.get('user').userId
  const sports = await getTrainingSports(c.env.DB, userId)
  return c.json(sports)
})

trainingRouter.post('/sports', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<TrainingSport>().catch(() => ({}) as TrainingSport)
  if (!body.label || !body.color) {
    return c.json({ error: 'Sport label and color are required', code: 'INVALID_DATA' }, 400)
  }
  const created = await createTrainingSport(c.env.DB, userId, body)
  return c.json(created, 201)
})

trainingRouter.put('/sports/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const body = await c.req.json<Partial<TrainingSport>>().catch(() => ({}))
  const updated = await updateTrainingSport(c.env.DB, userId, id, body)
  if (!updated) {
    return c.json({ error: 'Sport not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

trainingRouter.delete('/sports/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteTrainingSport(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Sport not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

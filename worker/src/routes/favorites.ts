import { Hono } from 'hono'
import { createFavorite, deleteFavorite, getFavorites } from '../db/queries/favorites'
import { authMiddleware } from '../middleware/auth'
import type { Env, Favorite } from '../types'

export const favoritesRouter = new Hono<{ Bindings: Env }>()

favoritesRouter.use('*', authMiddleware)

favoritesRouter.get('/', async (c) => {
  const userId = c.get('user').userId
  const favorites = await getFavorites(c.env.DB, userId)
  return c.json(favorites)
})

favoritesRouter.post('/', async (c) => {
  const userId = c.get('user').userId
  const body = await c.req.json<Favorite>().catch(() => ({}) as Favorite)
  if (!body.id || !body.name || !body.breed || !body.image) {
    return c.json({ error: 'id, name, breed, and image are required', code: 'INVALID_DATA' }, 400)
  }
  const created = await createFavorite(c.env.DB, userId, body)
  return c.json(created, 201)
})

favoritesRouter.delete('/:id', async (c) => {
  const userId = c.get('user').userId
  const id = c.req.param('id')
  const deleted = await deleteFavorite(c.env.DB, userId, id)
  if (!deleted) {
    return c.json({ error: 'Favorite not found', code: 'NOT_FOUND' }, 404)
  }
  return c.json({ success: true })
})

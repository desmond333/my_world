import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { adminRouter } from './routes/admin'
import { authRouter } from './routes/auth'
import { availabilityRouter } from './routes/availability'
import { birthdaysRouter } from './routes/birthdays'
import { collectionRouter } from './routes/collection'
import { favoritesRouter } from './routes/favorites'
import { financeRouter } from './routes/finance'
import { friendsRouter } from './routes/friends'
import { lotteryRouter } from './routes/lottery'
import { notesRouter } from './routes/notes'
import { productivityRouter } from './routes/productivity'
import { realtimeRouter } from './routes/realtime'
import { settingsRouter } from './routes/settings'
import { shopRouter } from './routes/shop'
import { subscriptionsRouter } from './routes/subscriptions'
import { syncRouter } from './routes/sync'
import { handleTmdbRequest, tmdbRouter } from './routes/tmdb'
import { trainingRouter } from './routes/training'
import { viewModesRouter } from './routes/viewModes'
import type { Env } from './types'

export type { Env }

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  }),
)

app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const durationMs = Date.now() - start
  const status = c.res.status
  if (status >= 400) {
    const log = {
      timestamp: new Date().toISOString(),
      level: status >= 500 ? 'error' : 'warn',
      method: c.req.method,
      path: c.req.path,
      status,
      durationMs,
      ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
    }
    console.warn(JSON.stringify(log))
  }
})

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = (c.env.ALLOWED_ORIGIN ?? '').trim()
      const frontend = (c.env.FRONTEND_ORIGIN ?? '').trim()
      if (!origin) return '*'
      if (allowed === '*' || allowed === '') return origin
      const list = [...allowed.split(','), ...frontend.split(',')].map((s) => s.trim()).filter(Boolean)
      if (list.includes('*') || list.includes(origin)) return origin
      return list[0] || null
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  }),
)

const routes = app
  .route('/auth', authRouter)
  .route('/api/settings', settingsRouter)
  .route('/api/training', trainingRouter)
  .route('/api/finance', financeRouter)
  .route('/api/productivity', productivityRouter)
  .route('/api/subscriptions', subscriptionsRouter)
  .route('/api/birthdays', birthdaysRouter)
  .route('/api/collection', collectionRouter)
  .route('/api/favorites', favoritesRouter)
  .route('/api/friends', friendsRouter)
  .route('/api/availability', availabilityRouter)
  .route('/api/lottery', lotteryRouter)
  .route('/api/notes', notesRouter)
  .route('/api/shop', shopRouter)
  .route('/api/view-modes', viewModesRouter)
  .route('/api/sync', syncRouter)
  .route('/api/realtime', realtimeRouter)
  .route('/admin', adminRouter)
  .route('/tmdb', tmdbRouter)

routes.get('/search/movie', async (c) => handleTmdbRequest(c))
routes.get('/genre/movie/list', async (c) => handleTmdbRequest(c))
routes.get('/movie/:id', async (c) => handleTmdbRequest(c))

routes.notFound((c) => {
  return c.json({ error: 'Endpoint not found', code: 'NOT_FOUND' }, 404)
})

routes.onError((err, c) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    method: c.req.method,
    path: c.req.path,
    ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  }
  console.error(JSON.stringify(errorLog))
  return c.json({ error: 'Internal Server Error', code: 'SERVER_ERROR' }, 500)
})

export type AppType = typeof routes
export default routes

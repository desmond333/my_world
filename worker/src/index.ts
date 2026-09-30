import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { adminRouter } from './routes/admin'
import { authRouter } from './routes/auth'
import { birthdaysRouter } from './routes/birthdays'
import { collectionRouter } from './routes/collection'
import { favoritesRouter } from './routes/favorites'
import { financeRouter } from './routes/finance'
import { friendsRouter } from './routes/friends'
import { lotteryRouter } from './routes/lottery'
import { notesRouter } from './routes/notes'
import { productivityRouter } from './routes/productivity'
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

app.route('/auth', authRouter)
app.route('/api/settings', settingsRouter)
app.route('/api/training', trainingRouter)
app.route('/api/finance', financeRouter)
app.route('/api/productivity', productivityRouter)
app.route('/api/subscriptions', subscriptionsRouter)
app.route('/api/birthdays', birthdaysRouter)
app.route('/api/collection', collectionRouter)
app.route('/api/favorites', favoritesRouter)
app.route('/api/friends', friendsRouter)
app.route('/api/lottery', lotteryRouter)
app.route('/api/notes', notesRouter)
app.route('/api/shop', shopRouter)
app.route('/api/view-modes', viewModesRouter)
app.route('/api/sync', syncRouter)
app.route('/admin', adminRouter)
app.route('/tmdb', tmdbRouter)

app.get('/search/movie', async (c) => handleTmdbRequest(c))
app.get('/genre/movie/list', async (c) => handleTmdbRequest(c))
app.get('/movie/:id', async (c) => handleTmdbRequest(c))

app.notFound((c) => {
  return c.json({ error: 'Endpoint not found', code: 'NOT_FOUND' }, 404)
})

app.onError((err, c) => {
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
  return c.json({ error: err.message || 'Internal Server Error', code: 'SERVER_ERROR' }, 500)
})

export default app

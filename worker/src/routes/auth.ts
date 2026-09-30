import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { generateSecureToken, hashPassword, hashToken, verifyPassword } from '../lib/crypto'
import { createAccessToken } from '../lib/jwt'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import type { Env, UserRole } from '../types'

type UserRow = {
  id: string
  email: string
  password_hash: string
  role: string
  created_at: string
}

type RefreshTokenRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
}

export const authRouter = new Hono<{ Bindings: Env }>()

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })

const REFRESH_TOKEN_COOKIE = 'refresh_token'
const REFRESH_TOKEN_DAYS = 30

const setRefreshTokenCookie = (c: { header: (key: string, value: string) => void }, token: string) => {
  setCookie(c as never, REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: REFRESH_TOKEN_DAYS * 86400,
  })
}

authRouter.post('/register', authLimiter, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!email || !email.includes('@') || email.length < 5) {
    return c.json({ error: 'Valid email is required', code: 'INVALID_EMAIL' }, 400)
  }

  if (!password || password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters', code: 'WEAK_PASSWORD' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>()

  if (existing) {
    return c.json({ error: 'User with this email already exists', code: 'USER_EXISTS' }, 409)
  }

  const passwordHash = await hashPassword(password)
  const userId = crypto.randomUUID()
  const adminEmail = (c.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const role: UserRole = adminEmail && email === adminEmail ? 'admin' : 'user'
  const createdAt = new Date().toISOString()

  await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(userId, email, passwordHash, role, createdAt)
    .run()

  const secret = c.env.JWT_SECRET || 'fallback-secret-key-replace-in-production'
  const accessToken = await createAccessToken(userId, role, secret)

  const refreshToken = generateSecureToken()
  const tokenHash = await hashToken(refreshToken)
  const tokenId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400 * 1000).toISOString()

  await c.env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(tokenId, userId, tokenHash, expiresAt)
    .run()

  setRefreshTokenCookie(c, refreshToken)

  return c.json(
    {
      user: { id: userId, email, role },
      accessToken,
    },
    201,
  )
})

authRouter.post('/login', authLimiter, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!email || !password) {
    return c.json({ error: 'Email and password are required', code: 'MISSING_CREDENTIALS' }, 400)
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>()

  if (!user) {
    return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
  }

  const secret = c.env.JWT_SECRET || 'fallback-secret-key-replace-in-production'
  const role = (user.role as UserRole) || 'user'
  const accessToken = await createAccessToken(user.id, role, secret)

  const refreshToken = generateSecureToken()
  const tokenHash = await hashToken(refreshToken)
  const tokenId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400 * 1000).toISOString()

  await c.env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(tokenId, user.id, tokenHash, expiresAt)
    .run()

  setRefreshTokenCookie(c, refreshToken)

  return c.json({
    user: { id: user.id, email: user.email, role },
    accessToken,
  })
})

authRouter.post('/logout', async (c) => {
  const token = getCookie(c, REFRESH_TOKEN_COOKIE)
  if (token) {
    const tokenHash = await hashToken(token)
    await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').bind(tokenHash).run()
  }

  deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: '/' })
  return c.json({ success: true })
})

authRouter.post('/refresh', async (c) => {
  const token = getCookie(c, REFRESH_TOKEN_COOKIE)
  if (!token) {
    return c.json({ error: 'Refresh token not found', code: 'UNAUTHORIZED' }, 401)
  }

  const tokenHash = await hashToken(token)
  const nowIso = new Date().toISOString()

  const session = await c.env.DB.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > ?')
    .bind(tokenHash, nowIso)
    .first<RefreshTokenRow>()

  if (!session) {
    deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: '/' })
    return c.json({ error: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' }, 401)
  }

  const user = await c.env.DB.prepare('SELECT id, email, role FROM users WHERE id = ?')
    .bind(session.user_id)
    .first<Pick<UserRow, 'id' | 'email' | 'role'>>()

  if (!user) {
    return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 401)
  }

  const secret = c.env.JWT_SECRET || 'fallback-secret-key-replace-in-production'
  const role = (user.role as UserRole) || 'user'
  const accessToken = await createAccessToken(user.id, role, secret)

  return c.json({ accessToken })
})

authRouter.get('/me', authMiddleware, async (c) => {
  const userContext = c.get('user')
  const user = await c.env.DB.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?')
    .bind(userContext.userId)
    .first<Omit<UserRow, 'password_hash'>>()

  if (!user) {
    return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 404)
  }

  return c.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  })
})

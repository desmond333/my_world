import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { vValidator } from '@hono/valibot-validator'
import { and, eq, gt } from 'drizzle-orm'
import { getDb } from '../db/client'
import { refreshTokens, users } from '../db/schema'
import {
  REFEREE_REWARD,
  claimReferralReward,
  findUserByReferralCode,
  getOrCreateReferralCode,
  getReferralStats,
  normalizeReferralCode,
  registerReferral,
} from '../db/queries/referrals'
import { isPremiumActive } from '../lib/premium'
import { generateSecureToken, hashPassword, hashToken, verifyPassword } from '../lib/crypto'
import { createAccessToken } from '../lib/jwt'
import { loginSchema, registerSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import type { Env, UserRole } from '../types'

export const authRouter = new Hono<{ Bindings: Env }>()

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })

const REFRESH_TOKEN_COOKIE = 'refresh_token'
const REFRESH_TOKEN_DAYS = 30

const resolveJwtSecret = (env: Env): string | null => {
  const secret = (env.JWT_SECRET || '').trim()
  if (secret) return secret
  // В продакшене секрет обязателен: фиксированный fallback позволяет подделать JWT.
  if ((env.ENVIRONMENT || '').toLowerCase() === 'production') return null
  return 'fallback-secret-key-replace-in-production'
}

const setRefreshTokenCookie = (c: { header: (key: string, value: string) => void }, token: string) => {
  setCookie(c as never, REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: REFRESH_TOKEN_DAYS * 86400,
  })
}

authRouter.post(
  '/register',
  authLimiter,
  vValidator('json', registerSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Valid email and password (min 6 characters) required', code: 'INVALID_INPUT', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const { email: rawEmail, password, referralCode } = c.req.valid('json')
    const email = rawEmail.trim().toLowerCase()

    const appDb = getDb(c.env.DB)
    const existing = await appDb.select({ id: users.id }).from(users).where(eq(users.email, email)).get()

    if (existing) {
      return c.json({ error: 'User with this email already exists', code: 'USER_EXISTS' }, 409)
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()
    const adminEmail = (c.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const role: UserRole = adminEmail && email === adminEmail ? 'admin' : 'user'
    const createdAt = new Date().toISOString()

    await appDb.insert(users).values({
      id: userId,
      email,
      passwordHash,
      role,
      createdAt,
      isPremium: role === 'admin' ? 1 : 0,
    })

    let referralReward = 0
    let referralStatus: 'none' | 'applied' | 'invalid' = 'none'
    if (referralCode && referralCode.trim()) {
      referralStatus = 'invalid'
      try {
        const referrer = await findUserByReferralCode(c.env.DB, referralCode)
        if (referrer && referrer.id !== userId) {
          await registerReferral(c.env.DB, {
            referrerId: referrer.id,
            refereeId: userId,
            code: normalizeReferralCode(referralCode),
          })
          referralReward = REFEREE_REWARD
          referralStatus = 'applied'
        }
      } catch {
        void 0
      }
    }

    let ownReferralCode: string | null = null
    try {
      ownReferralCode = await getOrCreateReferralCode(c.env.DB, userId)
    } catch {
      void 0
    }

    const secret = resolveJwtSecret(c.env)
    if (!secret) {
      return c.json({ error: 'Server misconfigured: JWT_SECRET is required', code: 'SERVER_MISCONFIGURED' }, 500)
    }
    const accessToken = await createAccessToken(userId, role, secret)

    const refreshToken = generateSecureToken()
    const tokenHash = await hashToken(refreshToken)
    const tokenId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400 * 1000).toISOString()

    await appDb.insert(refreshTokens).values({
      id: tokenId,
      userId,
      tokenHash,
      expiresAt,
    })

    setRefreshTokenCookie(c, refreshToken)

    return c.json(
      {
        user: { id: userId, email, role, premium: role === 'admin' },
        accessToken,
        referralCode: ownReferralCode,
        referralReward,
        referralStatus,
      },
      201,
    )
  },
)

authRouter.post(
  '/login',
  authLimiter,
  vValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Email and password are required', code: 'INVALID_CREDENTIALS', issues: result.issues }, 400)
    }
  }),
  async (c) => {
    const { email: rawEmail, password } = c.req.valid('json')
    const email = rawEmail.trim().toLowerCase()

    const appDb = getDb(c.env.DB)
    const user = await appDb.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
      return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
    }

    const secret = resolveJwtSecret(c.env)
    if (!secret) {
      return c.json({ error: 'Server misconfigured: JWT_SECRET is required', code: 'SERVER_MISCONFIGURED' }, 500)
    }
    const role = (user.role as UserRole) || 'user'
    const accessToken = await createAccessToken(user.id, role, secret)

    const refreshToken = generateSecureToken()
    const tokenHash = await hashToken(refreshToken)
    const tokenId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400 * 1000).toISOString()

    await appDb.insert(refreshTokens).values({
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    setRefreshTokenCookie(c, refreshToken)

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role,
        premium: isPremiumActive({ isPremium: user.isPremium, premiumUntil: user.premiumUntil }, new Date().toISOString()),
      },
      accessToken,
    })
  },
)

authRouter.post('/logout', async (c) => {
  const token = getCookie(c, REFRESH_TOKEN_COOKIE)
  if (token) {
    const tokenHash = await hashToken(token)
    const appDb = getDb(c.env.DB)
    await appDb.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).run()
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
  const appDb = getDb(c.env.DB)

  const session = await appDb
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, nowIso)))
    .get()

  if (!session) {
    deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: '/' })
    return c.json({ error: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' }, 401)
  }

  const user = await appDb
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .get()

  if (!user) {
    return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 401)
  }

  const secret = resolveJwtSecret(c.env)
  if (!secret) {
    return c.json({ error: 'Server misconfigured: JWT_SECRET is required', code: 'SERVER_MISCONFIGURED' }, 500)
  }
  const role = (user.role as UserRole) || 'user'
  const accessToken = await createAccessToken(user.id, role, secret)

  return c.json({ accessToken })
})

authRouter.get('/me', authMiddleware, async (c) => {
  const userContext = c.get('user')
  const appDb = getDb(c.env.DB)
  const user = await appDb
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(users)
    .where(eq(users.id, userContext.userId))
    .get()

  if (!user) {
    return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 404)
  }

  return c.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    premium: isPremiumActive({ isPremium: user.isPremium, premiumUntil: user.premiumUntil }, new Date().toISOString()),
    premiumUntil: user.premiumUntil ?? null,
  })
})

authRouter.get('/referral', authMiddleware, async (c) => {
  const userContext = c.get('user')
  try {
    const stats = await getReferralStats(c.env.DB, userContext.userId)
    return c.json(stats)
  } catch {
    return c.json({ error: 'Failed to load referral stats', code: 'REFERRAL_ERROR' }, 500)
  }
})

authRouter.post('/referral/claim', authMiddleware, async (c) => {
  const userContext = c.get('user')
  const body = await c.req.json<{ id?: string; type?: string }>().catch(() => ({}) as { id?: string; type?: string })

  if (!body.id || !body.type) {
    return c.json({ error: 'id and type are required', code: 'INVALID_INPUT' }, 400)
  }

  const result = await claimReferralReward(c.env.DB, userContext.userId, body.id, body.type)
  if (!result.ok) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'ALREADY_CLAIMED' ? 409 : 400
    return c.json({ error: result.error, code: result.error }, status)
  }

  const stats = await getReferralStats(c.env.DB, userContext.userId)
  return c.json({ ...result, stats })
})

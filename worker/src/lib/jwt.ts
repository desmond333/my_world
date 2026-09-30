import { sign, verify } from 'hono/jwt'
import type { UserRole, UserToken } from '../types'

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

export const createAccessToken = async (userId: string, role: UserRole, secret: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: userId,
    role,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  }
  return sign(payload, secret, 'HS256')
}

export const verifyAccessToken = async (token: string, secret: string): Promise<UserToken | null> => {
  try {
    const payload = (await verify(token, secret, 'HS256')) as {
      sub?: string
      role?: string
      exp?: number
    }
    if (!payload.sub || !payload.role) return null
    if (payload.role !== 'user' && payload.role !== 'admin') return null
    return {
      userId: payload.sub,
      role: payload.role as UserRole,
    }
  } catch {
    return null
  }
}

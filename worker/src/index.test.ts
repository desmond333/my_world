import { env } from 'cloudflare:test'
import { beforeAll, describe, expect, it } from 'vitest'
import app from './index'
import type { Env } from './types'

const testEnv = env as unknown as Env

describe('Worker App Endpoints', () => {
  beforeAll(async () => {
    await testEnv.DB.exec(
      'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT "user", created_at TEXT NOT NULL);' +
        'CREATE TABLE IF NOT EXISTS refresh_tokens (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL);',
    )
  })

  it('returns 404 with JSON for unknown route', async () => {
    const res = await app.request('/unknown-route', {}, testEnv)
    expect(res.status).toBe(404)
    const data = (await res.json()) as { error: string; code: string }
    expect(data).toEqual({ error: 'Endpoint not found', code: 'NOT_FOUND' })
  })

  it('includes secure headers in response', async () => {
    const res = await app.request('/unknown-route', {}, testEnv)
    expect(res.headers.get('x-frame-options')).toBe('DENY')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('rate limits brute force attempts on /auth/login', async () => {
    const headers = {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.195',
    }

    let lastStatus = 200
    for (let i = 0; i < 11; i++) {
      const res = await app.request(
        '/auth/login',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
        },
        testEnv,
      )
      lastStatus = res.status
    }

    expect(lastStatus).toBe(429)
  })
})

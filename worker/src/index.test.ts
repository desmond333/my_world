import { env } from 'cloudflare:test'
import { beforeAll, describe, expect, it } from 'vitest'
import app from './index'
import type { Env } from './types'

const testEnv = env as unknown as Env

describe('Worker App Endpoints', () => {
  beforeAll(async () => {
    await testEnv.DB.exec(
      'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT "user", created_at TEXT NOT NULL, referral_code TEXT, is_premium INTEGER NOT NULL DEFAULT 0, premium_until TEXT);' +
        'CREATE TABLE IF NOT EXISTS refresh_tokens (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL);' +
        'CREATE TABLE IF NOT EXISTS shop_state (user_id TEXT PRIMARY KEY, coins INTEGER NOT NULL DEFAULT 1000, unlocked_parts_json TEXT NOT NULL DEFAULT "{}", active_cat_skin TEXT NOT NULL DEFAULT "classic", active_theme_skin TEXT NOT NULL DEFAULT "default", greeting_sent INTEGER NOT NULL DEFAULT 0, greeting_friend_name TEXT NOT NULL DEFAULT "", greeting_timestamp INTEGER, greeting_reward_claimed INTEGER NOT NULL DEFAULT 0, has_pending_greeting_reply INTEGER NOT NULL DEFAULT 0);' +
        'CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY, referrer_id TEXT NOT NULL, referee_id TEXT NOT NULL UNIQUE, code TEXT NOT NULL, referrer_reward INTEGER NOT NULL DEFAULT 0, referee_reward INTEGER NOT NULL DEFAULT 0, reward_type TEXT, claimed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);' +
        'CREATE TABLE IF NOT EXISTS shop_coin_ops (id TEXT NOT NULL, user_id TEXT NOT NULL, reason TEXT NOT NULL, amount INTEGER NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (user_id, id));' +
        'CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, user_id TEXT, email TEXT NOT NULL DEFAULT "", topic TEXT NOT NULL DEFAULT "support", body TEXT NOT NULL, status TEXT NOT NULL DEFAULT "new", created_at TEXT NOT NULL);',
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

  it('validates input schema using valibot on /auth/register', async () => {
    const res = await app.request(
      '/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email', password: '123' }),
      },
      testEnv,
    )
    expect(res.status).toBe(400)
    const data = (await res.json()) as { error: string; code: string }
    expect(data.code).toBe('INVALID_INPUT')
  })

  it('rejects websocket request without upgrade header', async () => {
    const res = await app.request('/api/realtime/ws', {}, testEnv)
    expect(res.status).toBe(426)
  })

  it('registers a referral as a pending reward and claims it as coins or premium', async () => {
    const headers = { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.11' }

    const referrerRes = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email: `referrer-${Date.now()}@example.com`, password: 'secret123' }) },
      testEnv,
    )
    expect(referrerRes.status).toBe(201)
    const referrer = (await referrerRes.json()) as { referralCode: string; user: { id: string }; accessToken: string }
    expect(referrer.referralCode).toBeTruthy()

    const refereeRes = await app.request(
      '/auth/register',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: `referee-${Date.now()}@example.com`, password: 'secret123', referralCode: referrer.referralCode }),
      },
      testEnv,
    )
    expect(refereeRes.status).toBe(201)
    const referee = (await refereeRes.json()) as { referralReward: number; referralStatus: string; user: { id: string } }
    expect(referee.referralReward).toBe(100)
    expect(referee.referralStatus).toBe('applied')

    const auth = { 'content-type': 'application/json', authorization: `Bearer ${referrer.accessToken}` }
    const statsRes = await app.request('/auth/referral', { headers: auth }, testEnv)
    const stats = (await statsRes.json()) as { invited: number; pending: { id: string }[]; earned: number }
    expect(stats.invited).toBe(1)
    expect(stats.pending).toHaveLength(1)
    expect(stats.earned).toBe(0)

    const referrerBefore = await testEnv.DB.prepare('SELECT coins FROM shop_state WHERE user_id = ?')
      .bind(referrer.user.id)
      .first<{ coins: number }>()
    expect(referrerBefore?.coins ?? 1000).toBe(1000)

    // claim as coins
    const claimCoins = await app.request(
      '/auth/referral/claim',
      { method: 'POST', headers: auth, body: JSON.stringify({ id: stats.pending[0].id, type: 'coins' }) },
      testEnv,
    )
    expect(claimCoins.status).toBe(200)
    const claimCoinsData = (await claimCoins.json()) as { type: string; coins: number; stats: { pending: unknown[]; earned: number } }
    expect(claimCoinsData.type).toBe('coins')
    expect(claimCoinsData.coins).toBe(2000)
    expect(claimCoinsData.stats.pending).toHaveLength(0)
    expect(claimCoinsData.stats.earned).toBe(1000)

    // second friend -> claim as premium
    const secondRes = await app.request(
      '/auth/register',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: `referee2-${Date.now()}@example.com`, password: 'secret123', referralCode: referrer.referralCode }),
      },
      testEnv,
    )
    expect(secondRes.status).toBe(201)
    const stats2Res = await app.request('/auth/referral', { headers: auth }, testEnv)
    const stats2 = (await stats2Res.json()) as { pending: { id: string }[] }
    expect(stats2.pending).toHaveLength(1)

    const claimPremium = await app.request(
      '/auth/referral/claim',
      { method: 'POST', headers: auth, body: JSON.stringify({ id: stats2.pending[0].id, type: 'premium' }) },
      testEnv,
    )
    expect(claimPremium.status).toBe(200)
    const claimPremiumData = (await claimPremium.json()) as { type: string; premiumUntil: string }
    expect(claimPremiumData.type).toBe('premium')
    expect(claimPremiumData.premiumUntil).toBeTruthy()

    const meRes = await app.request('/auth/me', { headers: auth }, testEnv)
    expect(((await meRes.json()) as { premium: boolean }).premium).toBe(true)
  })

  it('ignores an unknown referral code without failing registration', async () => {
    const res = await app.request(
      '/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `unknown-ref-${Date.now()}@example.com`, password: 'secret123', referralCode: 'NOPE0000' }),
      },
      testEnv,
    )
    expect(res.status).toBe(201)
    const data = (await res.json()) as { referralStatus: string; referralReward: number }
    expect(data.referralStatus).toBe('invalid')
    expect(data.referralReward).toBe(0)
  })

  it('registers, logs in and returns the profile', async () => {
    const headers = { 'content-type': 'application/json' }
    const email = `auth-${Date.now()}@example.com`

    const registerRes = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    expect(registerRes.status).toBe(201)

    const loginRes = await app.request(
      '/auth/login',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    expect(loginRes.status).toBe(200)
    const login = (await loginRes.json()) as { accessToken: string }
    expect(login.accessToken).toBeTruthy()

    const meRes = await app.request('/auth/me', { headers: { authorization: `Bearer ${login.accessToken}` } }, testEnv)
    expect(meRes.status).toBe(200)
    const profile = (await meRes.json()) as { email: string }
    expect(profile.email).toBe(email)
  })

  it('credits earned coins server-side, dedupes ops and validates purchases', async () => {
    const headers = { 'content-type': 'application/json' }
    const email = `shop-${Date.now()}@example.com`
    const reg = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    const { accessToken } = (await reg.json()) as { accessToken: string }
    const auth = { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` }

    const earn1 = await app.request(
      '/api/shop/earn',
      { method: 'POST', headers: auth, body: JSON.stringify({ ops: [{ id: 'op-1', reason: 'task', amount: 10 }] }) },
      testEnv,
    )
    const r1 = (await earn1.json()) as { coins: number; accepted: string[] }
    expect(r1.coins).toBe(1010)
    expect(r1.accepted).toContain('op-1')

    const earn2 = await app.request(
      '/api/shop/earn',
      { method: 'POST', headers: auth, body: JSON.stringify({ ops: [{ id: 'op-1', reason: 'task', amount: 10 }] }) },
      testEnv,
    )
    const r2 = (await earn2.json()) as { coins: number; rejected: string[] }
    expect(r2.coins).toBe(1010)
    expect(r2.rejected).toContain('op-1')

    const earn3 = await app.request(
      '/api/shop/earn',
      { method: 'POST', headers: auth, body: JSON.stringify({ ops: [{ id: 'op-2', reason: 'dream', amount: 999999 }] }) },
      testEnv,
    )
    const r3 = (await earn3.json()) as { coins: number; rejected: string[] }
    expect(r3.coins).toBe(1010)
    expect(r3.rejected).toContain('op-2')

    const invalidKey = await app.request('/api/shop/buy', { method: 'POST', headers: auth, body: JSON.stringify({ key: 'nope' }) }, testEnv)
    expect(invalidKey.status).toBe(400)

    const buyOk = await app.request('/api/shop/buy', { method: 'POST', headers: auth, body: JSON.stringify({ key: 'lottery' }) }, testEnv)
    expect(buyOk.status).toBe(200)
    const bought = (await buyOk.json()) as { coins: number; unlockedParts: Record<string, boolean> }
    expect(bought.unlockedParts.lottery).toBe(true)
    expect(bought.coins).toBe(1010 - 250)

    const buyAgain = await app.request(
      '/api/shop/buy',
      { method: 'POST', headers: auth, body: JSON.stringify({ key: 'lottery' }) },
      testEnv,
    )
    expect(buyAgain.status).toBe(200)
    const again = (await buyAgain.json()) as { coins: number }
    expect(again.coins).toBe(1010 - 250)

    const earn4 = await app.request(
      '/api/shop/earn',
      { method: 'POST', headers: auth, body: JSON.stringify({ ops: [{ id: 'op-3', reason: 'dream', amount: 1000 }] }) },
      testEnv,
    )
    const r4 = (await earn4.json()) as { coins: number }
    expect(r4.coins).toBe(1010 - 250 + 1000)
  })

  it('ignores client-provided coins on PUT /api/shop', async () => {
    const headers = { 'content-type': 'application/json' }
    const email = `put-${Date.now()}@example.com`
    const reg = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    const { accessToken } = (await reg.json()) as { accessToken: string }

    const res = await app.request(
      '/api/shop',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ coins: 999999, activeThemeSkin: 'cyberpunk' }),
      },
      testEnv,
    )
    expect(res.status).toBe(200)
    const state = (await res.json()) as { coins: number; activeThemeSkin: string }
    expect(state.coins).toBe(1000)
    expect(state.activeThemeSkin).toBe('cyberpunk')
  })

  it('marks admin as premium and lets admin grant premium to others', async () => {
    const headers = { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.7' }

    const adminRes = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email: 'your@email.com', password: 'secret123' }) },
      testEnv,
    )
    expect(adminRes.status).toBe(201)
    const admin = (await adminRes.json()) as { user: { premium: boolean }; accessToken: string }
    expect(admin.user.premium).toBe(true)

    const normalRes = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email: `prem-${Date.now()}@example.com`, password: 'secret123' }) },
      testEnv,
    )
    const normal = (await normalRes.json()) as { user: { id: string; premium: boolean } }
    expect(normal.user.premium).toBe(false)

    const grant = await app.request(
      `/admin/users/${normal.user.id}/premium`,
      { method: 'POST', headers: { ...headers, authorization: `Bearer ${admin.accessToken}` }, body: JSON.stringify({ premium: true }) },
      testEnv,
    )
    expect(grant.status).toBe(200)
    expect(((await grant.json()) as { premium: boolean }).premium).toBe(true)

    const meRes = await app.request('/auth/me', { headers: { authorization: `Bearer ${admin.accessToken}` } }, testEnv)
    expect(((await meRes.json()) as { premium: boolean }).premium).toBe(true)
  })

  it('accepts a contact message and exposes it to admins', async () => {
    const headers = { 'content-type': 'application/json' }
    const email = `contact-${Date.now()}@example.com`

    const reg = await app.request(
      '/auth/register',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    expect(reg.status).toBe(201)
    const user = (await reg.json()) as { user: { id: string }; accessToken: string }

    const tooShort = await app.request(
      '/api/contact',
      { method: 'POST', headers: { ...headers, authorization: `Bearer ${user.accessToken}` }, body: JSON.stringify({ body: 'hi' }) },
      testEnv,
    )
    expect(tooShort.status).toBe(400)

    const sent = await app.request(
      '/api/contact',
      {
        method: 'POST',
        headers: { ...headers, authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ topic: 'idea', body: 'Привет, создатель! Добавь тёмную тему.' }),
      },
      testEnv,
    )
    expect(sent.status).toBe(200)
    expect(((await sent.json()) as { ok: boolean }).ok).toBe(true)

    await testEnv.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind('admin', user.user.id).run()
    const login = await app.request(
      '/auth/login',
      { method: 'POST', headers, body: JSON.stringify({ email, password: 'secret123' }) },
      testEnv,
    )
    const adminToken = ((await login.json()) as { accessToken: string }).accessToken

    const list = await app.request('/admin/messages', { headers: { authorization: `Bearer ${adminToken}` } }, testEnv)
    expect(list.status).toBe(200)
    const messages = (await list.json()) as { id: string; topic: string; status: string }[]
    expect(messages.some((m) => m.topic === 'idea')).toBe(true)

    const target = messages[0]
    const read = await app.request(
      `/admin/messages/${target.id}/status`,
      { method: 'POST', headers: { ...headers, authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ status: 'read' }) },
      testEnv,
    )
    expect(read.status).toBe(200)

    const removed = await app.request(
      `/admin/messages/${target.id}`,
      { method: 'DELETE', headers: { authorization: `Bearer ${adminToken}` } },
      testEnv,
    )
    expect(removed.status).toBe(200)
  })
})

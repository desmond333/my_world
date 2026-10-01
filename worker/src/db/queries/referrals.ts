import { and, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { referrals, users } from '../schema'
import { getShopState } from './shop'
import { addMonths, isPremiumActive } from '../../lib/premium'

export const REFEREE_REWARD = 100
export const REFERRAL_COINS = 1000
export const REFERRAL_PREMIUM_MONTHS = 2

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

const generateCode = (): string => {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return code
}

export const normalizeReferralCode = (code: string): string => code.trim().toUpperCase()

export const findUserByReferralCode = async (d1: D1Database, code: string): Promise<{ id: string } | null> => {
  const db = getDb(d1)
  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, normalizeReferralCode(code)))
    .get()

  return row ?? null
}

export const getOrCreateReferralCode = async (d1: D1Database, userId: string): Promise<string> => {
  const db = getDb(d1)
  const current = await db.select({ code: users.referralCode }).from(users).where(eq(users.id, userId)).get()

  if (current?.code) return current.code

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCode()
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, code)).get()
    if (existing) continue

    await db.update(users).set({ referralCode: code }).where(eq(users.id, userId))
    return code
  }

  throw new Error('Failed to generate referral code')
}

const SHOP_UPSERT_COINS_SQL = `INSERT INTO shop_state (
  user_id, coins, unlocked_parts_json, active_cat_skin, active_theme_skin,
  greeting_sent, greeting_friend_name, greeting_timestamp, greeting_reward_claimed, has_pending_greeting_reply
) VALUES (?, ?, '{}', 'classic', 'default', 0, '', NULL, 0, 0)
ON CONFLICT(user_id) DO UPDATE SET coins = excluded.coins`

export const registerReferral = async (d1: D1Database, input: { referrerId: string; refereeId: string; code: string }): Promise<void> => {
  const refereeShop = await getShopState(d1, input.refereeId)
  const refereeCoins = (refereeShop.coins ?? 0) + REFEREE_REWARD

  await d1.batch([
    d1
      .prepare(
        `INSERT INTO referrals (id, referrer_id, referee_id, code, referrer_reward, referee_reward, reward_type, claimed, created_at)
         VALUES (?, ?, ?, ?, 0, ?, NULL, 0, ?)`,
      )
      .bind(crypto.randomUUID(), input.referrerId, input.refereeId, input.code, REFEREE_REWARD, new Date().toISOString()),
    d1.prepare(SHOP_UPSERT_COINS_SQL).bind(input.refereeId, refereeCoins),
  ])
}

export type PendingReferral = { id: string; createdAt: string }

export type ReferralStats = {
  code: string
  invited: number
  earned: number
  pending: PendingReferral[]
  premiumUntil: string | null
}

export const getReferralStats = async (d1: D1Database, userId: string): Promise<ReferralStats> => {
  const db = getDb(d1)
  const code = await getOrCreateReferralCode(d1, userId)
  const rows = await db
    .select({ id: referrals.id, referrerReward: referrals.referrerReward, claimed: referrals.claimed, createdAt: referrals.createdAt })
    .from(referrals)
    .where(eq(referrals.referrerId, userId))

  const user = await db
    .select({ isPremium: users.isPremium, premiumUntil: users.premiumUntil })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  return {
    code,
    invited: rows.length,
    earned: rows.reduce((sum, row) => sum + (row.claimed ? row.referrerReward || 0 : 0), 0),
    pending: rows.filter((row) => !row.claimed).map((row) => ({ id: row.id, createdAt: row.createdAt })),
    premiumUntil: user?.premiumUntil ?? null,
  }
}

export type ClaimResult =
  | { ok: true; type: 'coins'; coins: number; premiumUntil: string | null }
  | { ok: true; type: 'premium'; premiumUntil: string }
  | { ok: false; error: 'NOT_FOUND' | 'INVALID_TYPE' | 'ALREADY_CLAIMED' }

export const claimReferralReward = async (d1: D1Database, userId: string, referralId: string, type: string): Promise<ClaimResult> => {
  if (type !== 'coins' && type !== 'premium') return { ok: false, error: 'INVALID_TYPE' }

  const db = getDb(d1)
  const referral = await db
    .select({ id: referrals.id, claimed: referrals.claimed })
    .from(referrals)
    .where(and(eq(referrals.id, referralId), eq(referrals.referrerId, userId)))
    .get()

  if (!referral) return { ok: false, error: 'NOT_FOUND' }
  if (referral.claimed) return { ok: false, error: 'ALREADY_CLAIMED' }

  const now = new Date().toISOString()

  if (type === 'coins') {
    const shop = await getShopState(d1, userId)
    const coins = (shop.coins ?? 0) + REFERRAL_COINS
    await d1.batch([
      d1
        .prepare('UPDATE referrals SET claimed = 1, reward_type = ?, referrer_reward = ? WHERE id = ?')
        .bind('coins', REFERRAL_COINS, referralId),
      d1.prepare(SHOP_UPSERT_COINS_SQL).bind(userId, coins),
    ])
    return { ok: true, type: 'coins', coins, premiumUntil: null }
  }

  const user = await db
    .select({ isPremium: users.isPremium, premiumUntil: users.premiumUntil })
    .from(users)
    .where(eq(users.id, userId))
    .get()
  const base = isPremiumActive({ isPremium: user?.isPremium, premiumUntil: user?.premiumUntil }, now) ? (user?.premiumUntil ?? now) : now
  const premiumUntil = addMonths(base > now ? base : now, REFERRAL_PREMIUM_MONTHS)

  await d1.batch([
    d1.prepare('UPDATE referrals SET claimed = 1, reward_type = ?, referrer_reward = 0 WHERE id = ?').bind('premium', referralId),
    d1.prepare('UPDATE users SET premium_until = ? WHERE id = ?').bind(premiumUntil, userId),
  ])

  return { ok: true, type: 'premium', premiumUntil }
}

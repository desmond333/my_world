import { eq } from 'drizzle-orm'
import { getDb } from '../client'
import { referrals, users } from '../schema'
import { getShopState } from './shop'

export const REFERRER_REWARD = 250
export const REFEREE_REWARD = 100

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

export const applyReferralRewards = async (
  d1: D1Database,
  input: { referrerId: string; refereeId: string; code: string; referrerReward: number; refereeReward: number },
): Promise<void> => {
  const [referrerShop, refereeShop] = await Promise.all([getShopState(d1, input.referrerId), getShopState(d1, input.refereeId)])

  const referrerCoins = (referrerShop.coins ?? 0) + input.referrerReward
  const refereeCoins = (refereeShop.coins ?? 0) + input.refereeReward

  await d1.batch([
    d1
      .prepare(
        'INSERT INTO referrals (id, referrer_id, referee_id, code, referrer_reward, referee_reward, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        crypto.randomUUID(),
        input.referrerId,
        input.refereeId,
        input.code,
        input.referrerReward,
        input.refereeReward,
        new Date().toISOString(),
      ),
    d1.prepare(SHOP_UPSERT_COINS_SQL).bind(input.referrerId, referrerCoins),
    d1.prepare(SHOP_UPSERT_COINS_SQL).bind(input.refereeId, refereeCoins),
  ])
}

export type ReferralStats = {
  code: string
  invited: number
  earned: number
}

export const getReferralStats = async (d1: D1Database, userId: string): Promise<ReferralStats> => {
  const db = getDb(d1)
  const code = await getOrCreateReferralCode(d1, userId)
  const rows = await db.select({ referrerReward: referrals.referrerReward }).from(referrals).where(eq(referrals.referrerId, userId))

  return {
    code,
    invited: rows.length,
    earned: rows.reduce((sum, row) => sum + (row.referrerReward || 0), 0),
  }
}

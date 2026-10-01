import { eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { shopState } from '../schema'
import { EARN_RULES, SHOP_PART_PRICES, isShopPartKey, isValidEarn } from '../../lib/economy'
import type { CatSkinId, ShopItemKey, ShopStateData, ThemeSkinId } from '../../types'

const DEFAULT_SHOP_STATE: ShopStateData = {
  coins: 1000,
  unlockedParts: {
    lottery: false,
    statham: false,
    cat_wizard: false,
    cat_cyber: false,
    theme_cyberpunk: false,
    theme_midnight_gold: false,
    sound_lofi: false,
  },
  activeCatSkin: 'classic',
  activeThemeSkin: 'default',
  greetingSent: false,
  greetingFriendName: '',
  greetingTimestamp: null,
  greetingRewardClaimed: false,
  hasPendingGreetingReply: false,
}

export const getShopState = async (d1: D1Database, userId: string): Promise<ShopStateData> => {
  const db = getDb(d1)
  const row = await db.select().from(shopState).where(eq(shopState.userId, userId)).get()

  if (!row) return DEFAULT_SHOP_STATE

  return {
    coins: row.coins,
    unlockedParts: parseJson<Partial<Record<ShopItemKey, boolean>>>(row.unlockedPartsJson, DEFAULT_SHOP_STATE.unlockedParts),
    activeCatSkin: (row.activeCatSkin as CatSkinId) || 'classic',
    activeThemeSkin: (row.activeThemeSkin as ThemeSkinId) || 'default',
    greetingSent: Boolean(row.greetingSent),
    greetingFriendName: row.greetingFriendName || '',
    greetingTimestamp: row.greetingTimestamp,
    greetingRewardClaimed: Boolean(row.greetingRewardClaimed),
    hasPendingGreetingReply: Boolean(row.hasPendingGreetingReply),
  }
}

export const updateShopState = async (d1: D1Database, userId: string, patch: Partial<ShopStateData>): Promise<ShopStateData> => {
  const current = await getShopState(d1, userId)
  const merged: ShopStateData = {
    coins: patch.coins !== undefined ? patch.coins : current.coins,
    unlockedParts: patch.unlockedParts ? { ...current.unlockedParts, ...patch.unlockedParts } : current.unlockedParts,
    activeCatSkin: patch.activeCatSkin ?? current.activeCatSkin,
    activeThemeSkin: patch.activeThemeSkin ?? current.activeThemeSkin,
    greetingSent: patch.greetingSent !== undefined ? patch.greetingSent : current.greetingSent,
    greetingFriendName: patch.greetingFriendName !== undefined ? patch.greetingFriendName : current.greetingFriendName,
    greetingTimestamp: patch.greetingTimestamp !== undefined ? patch.greetingTimestamp : current.greetingTimestamp,
    greetingRewardClaimed: patch.greetingRewardClaimed !== undefined ? patch.greetingRewardClaimed : current.greetingRewardClaimed,
    hasPendingGreetingReply: patch.hasPendingGreetingReply !== undefined ? patch.hasPendingGreetingReply : current.hasPendingGreetingReply,
  }

  const db = getDb(d1)
  await db
    .insert(shopState)
    .values({
      userId,
      coins: merged.coins,
      unlockedPartsJson: JSON.stringify(merged.unlockedParts),
      activeCatSkin: merged.activeCatSkin,
      activeThemeSkin: merged.activeThemeSkin,
      greetingSent: merged.greetingSent ? 1 : 0,
      greetingFriendName: merged.greetingFriendName,
      greetingTimestamp: merged.greetingTimestamp,
      greetingRewardClaimed: merged.greetingRewardClaimed ? 1 : 0,
      hasPendingGreetingReply: merged.hasPendingGreetingReply ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: shopState.userId,
      set: {
        coins: merged.coins,
        unlockedPartsJson: JSON.stringify(merged.unlockedParts),
        activeCatSkin: merged.activeCatSkin,
        activeThemeSkin: merged.activeThemeSkin,
        greetingSent: merged.greetingSent ? 1 : 0,
        greetingFriendName: merged.greetingFriendName,
        greetingTimestamp: merged.greetingTimestamp,
        greetingRewardClaimed: merged.greetingRewardClaimed ? 1 : 0,
        hasPendingGreetingReply: merged.hasPendingGreetingReply ? 1 : 0,
      },
    })

  return merged
}

export type CoinOp = { id: string; reason: string; amount: number }

export type CoinOpResult = {
  coins: number
  accepted: string[]
  rejected: string[]
}

export const applyCoinOps = async (d1: D1Database, userId: string, ops: CoinOp[]): Promise<CoinOpResult> => {
  const today = new Date().toISOString().slice(0, 10)

  const spentRows = await d1
    .prepare('SELECT reason, SUM(amount) AS total FROM shop_coin_ops WHERE user_id = ? AND substr(created_at, 1, 10) = ? GROUP BY reason')
    .bind(userId, today)
    .all<{ reason: string; total: number }>()

  const spent = new Map<string, number>((spentRows.results ?? []).map((row) => [row.reason, row.total ?? 0]))
  const accepted: string[] = []
  const rejected: string[] = []
  let credited = 0

  for (const op of ops) {
    if (!isValidEarn(op.reason, op.amount)) {
      rejected.push(op.id)
      continue
    }

    const rule = EARN_RULES[op.reason]
    const used = spent.get(op.reason) ?? 0
    if (used + op.amount > rule.dailyCap) {
      rejected.push(op.id)
      continue
    }

    const insert = await d1
      .prepare('INSERT INTO shop_coin_ops (id, user_id, reason, amount, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING')
      .bind(op.id, userId, op.reason, op.amount, new Date().toISOString())
      .run()

    if ((insert.meta?.changes ?? 0) === 0) {
      rejected.push(op.id)
      continue
    }

    spent.set(op.reason, used + op.amount)
    credited += op.amount
    accepted.push(op.id)
  }

  if (credited > 0) {
    await d1
      .prepare('INSERT INTO shop_state (user_id, coins) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET coins = coins + ?')
      .bind(userId, 1000 + credited, credited)
      .run()
  }

  const state = await getShopState(d1, userId)
  return { coins: state.coins, accepted, rejected }
}

export type PurchaseResult = {
  ok: boolean
  error?: 'INVALID_KEY' | 'INSUFFICIENT_FUNDS'
  state: ShopStateData
}

export const purchaseShopItem = async (d1: D1Database, userId: string, key: string): Promise<PurchaseResult> => {
  if (!isShopPartKey(key)) {
    return { ok: false, error: 'INVALID_KEY', state: await getShopState(d1, userId) }
  }

  const current = await getShopState(d1, userId)
  if (current.unlockedParts[key]) {
    return { ok: true, state: current }
  }

  const price = SHOP_PART_PRICES[key]
  if (current.coins < price) {
    return { ok: false, error: 'INSUFFICIENT_FUNDS', state: current }
  }

  await updateShopState(d1, userId, {
    coins: current.coins - price,
    unlockedParts: { ...current.unlockedParts, [key]: true },
  })

  return { ok: true, state: await getShopState(d1, userId) }
}

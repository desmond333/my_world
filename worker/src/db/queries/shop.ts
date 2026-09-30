import { parseJson } from '../client'
import type { CatSkinId, ShopItemKey, ShopStateData, ThemeSkinId } from '../../types'

type ShopRow = {
  user_id: string
  coins: number
  unlocked_parts_json: string
  active_cat_skin: string
  active_theme_skin: string
  greeting_sent: number
  greeting_friend_name: string
  greeting_timestamp: number | null
  greeting_reward_claimed: number
  has_pending_greeting_reply: number
}

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

export const getShopState = async (db: D1Database, userId: string): Promise<ShopStateData> => {
  const row = await db.prepare('SELECT * FROM shop_state WHERE user_id = ?').bind(userId).first<ShopRow>()

  if (!row) return DEFAULT_SHOP_STATE

  return {
    coins: row.coins,
    unlockedParts: parseJson<Partial<Record<ShopItemKey, boolean>>>(row.unlocked_parts_json, DEFAULT_SHOP_STATE.unlockedParts),
    activeCatSkin: (row.active_cat_skin as CatSkinId) || 'classic',
    activeThemeSkin: (row.active_theme_skin as ThemeSkinId) || 'default',
    greetingSent: Boolean(row.greeting_sent),
    greetingFriendName: row.greeting_friend_name || '',
    greetingTimestamp: row.greeting_timestamp,
    greetingRewardClaimed: Boolean(row.greeting_reward_claimed),
    hasPendingGreetingReply: Boolean(row.has_pending_greeting_reply),
  }
}

export const updateShopState = async (db: D1Database, userId: string, patch: Partial<ShopStateData>): Promise<ShopStateData> => {
  const current = await getShopState(db, userId)
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

  await db
    .prepare(
      `INSERT INTO shop_state (
        user_id, coins, unlocked_parts_json, active_cat_skin, active_theme_skin,
        greeting_sent, greeting_friend_name, greeting_timestamp,
        greeting_reward_claimed, has_pending_greeting_reply
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        coins = excluded.coins,
        unlocked_parts_json = excluded.unlocked_parts_json,
        active_cat_skin = excluded.active_cat_skin,
        active_theme_skin = excluded.active_theme_skin,
        greeting_sent = excluded.greeting_sent,
        greeting_friend_name = excluded.greeting_friend_name,
        greeting_timestamp = excluded.greeting_timestamp,
        greeting_reward_claimed = excluded.greeting_reward_claimed,
        has_pending_greeting_reply = excluded.has_pending_greeting_reply`,
    )
    .bind(
      userId,
      merged.coins,
      JSON.stringify(merged.unlockedParts),
      merged.activeCatSkin,
      merged.activeThemeSkin,
      merged.greetingSent ? 1 : 0,
      merged.greetingFriendName,
      merged.greetingTimestamp,
      merged.greetingRewardClaimed ? 1 : 0,
      merged.hasPendingGreetingReply ? 1 : 0,
    )
    .run()

  return merged
}

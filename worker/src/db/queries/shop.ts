import { eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { shopState } from '../schema'
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

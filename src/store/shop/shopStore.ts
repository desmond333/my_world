import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { catSkinToShopKey, PART_PRICES, themeSkinToShopKey } from '../../lib/shop'
import type { CatSkinId, ShopItemKey, ThemeSkinId } from '../../lib/shop'
import { ApiError, getAuthToken } from '../../services/api/apiClient'
import { rpc, rpcError } from '../../services/api/rpcClient'

export { PART_PRICES }
export type { CatSkinId, ShopItemKey, ThemeSkinId }

export const SHOP_DEV_UNLOCK_ALL = import.meta.env.DEV || import.meta.env.VITE_SHOP_DEV_UNLOCK_ALL === 'true'

export type CoinOp = {
  id: string
  reason: string
  amount: number
}

export type PurchaseResult = {
  success: boolean
  error?: 'insufficient' | 'offline' | 'invalid'
}

export type ShopState = {
  coins: number
  unlockedParts: Partial<Record<ShopItemKey, boolean>>
  activeCatSkin: CatSkinId
  activeThemeSkin: ThemeSkinId
  greetingSent: boolean
  greetingFriendName: string
  greetingTimestamp: number | null
  greetingRewardClaimed: boolean
  hasPendingGreetingReply: boolean
  pendingOps: CoinOp[]
  buyPart: (key: ShopItemKey) => Promise<PurchaseResult>
  isUnlocked: (key: ShopItemKey) => boolean
  equipCatSkin: (skin: CatSkinId) => void
  equipThemeSkin: (theme: ThemeSkinId) => void
  credit: (reason: string, amount: number) => void
  flushOps: () => Promise<void>
  sendFriendGreeting: (friendName: string) => void
  claimFriendGreetingReply: () => number
}

const STORAGE_KEY = STORAGE_KEYS.shop

const createOpId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

let flushPromise: Promise<void> | null = null

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      coins: 1000,
      unlockedParts: {
        lottery: false,
        statham: false,
        cat_wizard: false,
        cat_cyber: false,
        theme_spring: false,
        theme_summer: false,
        theme_autumn: false,
        theme_winter: false,
        theme_cyberpunk: false,
        theme_midnight_gold: false,
        theme_violet: false,
        theme_anime: false,
        sound_lofi: false,
        lang_advanced: false,
        notes_advanced: false,
        view_normal: false,
        finance_advice: false,
        motion_pro: false,
      },
      activeCatSkin: 'classic',
      activeThemeSkin: 'default',
      greetingSent: false,
      greetingFriendName: '',
      greetingTimestamp: null,
      greetingRewardClaimed: false,
      hasPendingGreetingReply: false,
      pendingOps: [],

      isUnlocked: (key) => SHOP_DEV_UNLOCK_ALL || Boolean(get().unlockedParts?.[key]),

      buyPart: async (key) => {
        if (SHOP_DEV_UNLOCK_ALL) return { success: true }
        const state = get()
        if (state.unlockedParts?.[key]) return { success: true }
        if (!getAuthToken()) return { success: false, error: 'offline' }

        try {
          const res = await rpc.api.shop.buy.$post({ json: { key } })
          if (!res.ok) throw await rpcError(res, 'Failed to buy item')
          const data = await res.json()
          set({ coins: data.coins, unlockedParts: data.unlockedParts })
          return { success: true }
        } catch (err: unknown) {
          if (err instanceof ApiError && err.code === 'INSUFFICIENT_FUNDS') return { success: false, error: 'insufficient' }
          if (err instanceof ApiError && err.code === 'INVALID_KEY') return { success: false, error: 'invalid' }
          return { success: false, error: 'offline' }
        }
      },

      equipCatSkin: (skin) => {
        if (skin === 'classic') {
          set({ activeCatSkin: 'classic' })
          return
        }
        const key = catSkinToShopKey(skin)
        if (key && get().isUnlocked(key)) {
          set({ activeCatSkin: skin })
        }
      },

      equipThemeSkin: (theme) => {
        if (theme === 'default') {
          set({ activeThemeSkin: 'default' })
          return
        }
        const key = themeSkinToShopKey(theme)
        if (key && get().isUnlocked(key)) {
          set({ activeThemeSkin: theme })
        }
      },

      credit: (reason, amount) => {
        if (amount <= 0) return
        const op: CoinOp = { id: createOpId(), reason, amount }
        set((state) => ({ coins: state.coins + amount, pendingOps: [...state.pendingOps, op] }))
        void get().flushOps()
      },

      flushOps: async () => {
        if (flushPromise) return flushPromise

        flushPromise = (async () => {
          for (;;) {
            const ops = get().pendingOps
            if (ops.length === 0 || !getAuthToken()) return

            const sent = new Set(ops.map((op) => op.id))

            try {
              const res = await rpc.api.shop.earn.$post({ json: { ops } })
              if (!res.ok) throw await rpcError(res, 'Failed to flush coin operations')
              const data = await res.json()
              const settled = new Set([...data.accepted, ...data.rejected])
              set((state) => {
                const newOpsArrived = state.pendingOps.some((op) => !sent.has(op.id))
                return {
                  coins: newOpsArrived ? state.coins : data.coins,
                  pendingOps: state.pendingOps.filter((op) => !settled.has(op.id)),
                }
              })
            } catch {
              return
            }
          }
        })().finally(() => {
          flushPromise = null
        })

        return flushPromise
      },

      sendFriendGreeting: (friendName) => {
        set({
          greetingSent: true,
          greetingFriendName: friendName.trim(),
          greetingTimestamp: Date.now(),
          hasPendingGreetingReply: true,
          greetingRewardClaimed: false,
        })
      },

      claimFriendGreetingReply: () => {
        const state = get()
        if (!state.hasPendingGreetingReply) return 0
        set({
          hasPendingGreetingReply: false,
          greetingRewardClaimed: true,
        })
        get().credit('greeting', 100)
        return 100
      },
    }),
    {
      name: STORAGE_KEY,
      storage: hybridPersistStorage,
      version: 3,
    },
  ),
)

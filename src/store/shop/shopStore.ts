import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { ApiError, apiFetch, getAuthToken } from '../../services/api/apiClient'

export type ShopItemKey = 'lottery' | 'statham' | 'cat_wizard' | 'cat_cyber' | 'theme_cyberpunk' | 'theme_midnight_gold' | 'sound_lofi'

export type CatSkinId = 'classic' | 'wizard' | 'cyber'
export type ThemeSkinId = 'default' | 'cyberpunk' | 'midnight_gold'

export const SHOP_DEV_UNLOCK_ALL = import.meta.env.DEV || import.meta.env.VITE_SHOP_DEV_UNLOCK_ALL === 'true'

export const PART_PRICES: Record<ShopItemKey, number> = {
  lottery: 250,
  statham: 250,
  cat_wizard: 200,
  cat_cyber: 200,
  theme_cyberpunk: 150,
  theme_midnight_gold: 150,
  sound_lofi: 200,
}

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

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
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
      pendingOps: [],

      isUnlocked: (key) => SHOP_DEV_UNLOCK_ALL || Boolean(get().unlockedParts?.[key]),

      buyPart: async (key) => {
        if (SHOP_DEV_UNLOCK_ALL) return { success: true }
        const state = get()
        if (state.unlockedParts?.[key]) return { success: true }
        if (!getAuthToken()) return { success: false, error: 'offline' }

        try {
          const res = await apiFetch<{ coins: number; unlockedParts: Partial<Record<ShopItemKey, boolean>> }>('/api/shop/buy', {
            method: 'POST',
            body: JSON.stringify({ key }),
          })
          set({ coins: res.coins, unlockedParts: res.unlockedParts })
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
        const key: ShopItemKey = skin === 'wizard' ? 'cat_wizard' : 'cat_cyber'
        if (get().isUnlocked(key)) {
          set({ activeCatSkin: skin })
        }
      },

      equipThemeSkin: (theme) => {
        if (theme === 'default') {
          set({ activeThemeSkin: 'default' })
          return
        }
        const key: ShopItemKey = theme === 'cyberpunk' ? 'theme_cyberpunk' : 'theme_midnight_gold'
        if (get().isUnlocked(key)) {
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
        const ops = get().pendingOps
        if (ops.length === 0 || !getAuthToken()) return

        try {
          const res = await apiFetch<{ coins: number; accepted: string[]; rejected: string[] }>('/api/shop/earn', {
            method: 'POST',
            body: JSON.stringify({ ops }),
          })
          const settled = new Set([...res.accepted, ...res.rejected])
          set((state) => ({ coins: res.coins, pendingOps: state.pendingOps.filter((op) => !settled.has(op.id)) }))
        } catch {
          void 0
        }
      },

      sendFriendGreeting: (friendName) => {
        set({
          greetingSent: true,
          greetingFriendName: friendName.trim() || 'Странник снов',
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

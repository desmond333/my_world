import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'

export type ShopItemKey = 'lottery' | 'statham' | 'cat_wizard' | 'cat_cyber' | 'theme_cyberpunk' | 'theme_midnight_gold' | 'sound_lofi'

export type CatSkinId = 'classic' | 'wizard' | 'cyber'
export type ThemeSkinId = 'default' | 'cyberpunk' | 'midnight_gold'

export const SHOP_DEV_UNLOCK_ALL = true

export const PART_PRICES: Record<ShopItemKey, number> = {
  lottery: 250,
  statham: 250,
  cat_wizard: 200,
  cat_cyber: 200,
  theme_cyberpunk: 150,
  theme_midnight_gold: 150,
  sound_lofi: 200,
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
  buyPart: (key: ShopItemKey) => boolean
  isUnlocked: (key: ShopItemKey) => boolean
  equipCatSkin: (skin: CatSkinId) => void
  equipThemeSkin: (theme: ThemeSkinId) => void
  addCoins: (amount: number) => void
  sendFriendGreeting: (friendName: string) => void
  claimFriendGreetingReply: () => number
}

const STORAGE_KEY = 'tau-shop-economy'

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

      isUnlocked: (key) => SHOP_DEV_UNLOCK_ALL || Boolean(get().unlockedParts?.[key]),

      buyPart: (key) => {
        const state = get()
        if (SHOP_DEV_UNLOCK_ALL) return true
        const price = PART_PRICES[key] ?? 250
        if (state.coins < price || state.unlockedParts?.[key]) {
          return false
        }
        set({
          coins: state.coins - price,
          unlockedParts: {
            ...state.unlockedParts,
            [key]: true,
          },
        })
        return true
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

      addCoins: (amount) => {
        if (amount <= 0) return
        set((state) => ({ coins: state.coins + amount }))
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
          coins: state.coins + 100,
        })
        return 100
      },
    }),
    {
      name: STORAGE_KEY,
      storage: hybridPersistStorage,
      version: 2,
    },
  ),
)

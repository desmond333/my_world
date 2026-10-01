import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'

export type PremiumSectionId = 'financeAdvice'

export const PREMIUM_DEV_UNLOCK_ALL = import.meta.env.DEV || import.meta.env.VITE_PREMIUM_DEV_UNLOCK_ALL === 'true'

export type PremiumState = {
  unlocked: Partial<Record<PremiumSectionId, boolean>>
  unlock: (id: PremiumSectionId) => void
  isUnlocked: (id: PremiumSectionId) => boolean
  reset: () => void
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      unlocked: {},

      unlock: (id) => set((state) => ({ unlocked: { ...state.unlocked, [id]: true } })),

      isUnlocked: (id) => PREMIUM_DEV_UNLOCK_ALL || Boolean(get().unlocked?.[id]),

      reset: () => set({ unlocked: {} }),
    }),
    { name: STORAGE_KEYS.premium, storage: hybridPersistStorage },
  ),
)

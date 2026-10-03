import { create } from 'zustand'

export type MotionDoseOverride = 'base' | 'full' | null
export type PremiumOverride = 'real' | 'premium' | 'base'

type MotionDevState = {
  override: MotionDoseOverride
  premiumOverride: PremiumOverride
  setOverride: (override: MotionDoseOverride) => void
  setPremiumOverride: (premiumOverride: PremiumOverride) => void
}

export const useMotionDevStore = create<MotionDevState>((set) => ({
  override: null,
  premiumOverride: 'real',
  setOverride: (override) => set({ override }),
  setPremiumOverride: (premiumOverride) => set({ premiumOverride }),
}))

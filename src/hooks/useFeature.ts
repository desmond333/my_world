import { FEATURES, type FeatureDefinition, type FeatureId } from '../lib/features'
import { useAuthStore } from '../store/auth'
import { useMotionDevStore } from '../store/motionDev'
import { SHOP_DEV_UNLOCK_ALL, useShopStore } from '../store/shop'

export const useIsPremium = () => {
  const user = useAuthStore((state) => state.user)
  const real = Boolean(user?.premium) || user?.role === 'admin'
  const override = useMotionDevStore((state) => state.premiumOverride)

  if (!import.meta.env.DEV) return real
  if (override === 'premium') return true
  if (override === 'base') return false
  return real
}

export const useFeature = (id: FeatureId) => {
  const def: FeatureDefinition = FEATURES[id]
  const isPremium = useIsPremium()
  const owned = useShopStore((state) => (def.shopKey ? Boolean(state.unlockedParts?.[def.shopKey]) : false))
  const override = useMotionDevStore((state) => state.premiumOverride)
  const devUnlock = import.meta.env.DEV && override === 'real' && SHOP_DEV_UNLOCK_ALL
  const unlocked = def.access === 'free' || isPremium || devUnlock || owned

  return { id, ...def, isPremium, owned, unlocked }
}

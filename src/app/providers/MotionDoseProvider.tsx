import { useEffect, type ReactNode } from 'react'
import { useIsPremium } from '../../hooks'
import { useMotionDevStore, useShopStore, SHOP_DEV_UNLOCK_ALL } from '../../store'
import { MotionDoseContext } from '../../shared/ui'

export const MotionDoseProvider = ({ children }: { children: ReactNode }) => {
  const isPremium = useIsPremium()
  const ownsMotionPack = useShopStore((state) => Boolean(state.unlockedParts?.motion_pro))
  const override = useMotionDevStore((state) => state.override)
  const premiumOverride = useMotionDevStore((state) => state.premiumOverride)
  const devFull = SHOP_DEV_UNLOCK_ALL && premiumOverride === 'real'
  const full = override ? override === 'full' : isPremium || ownsMotionPack || devFull

  useEffect(() => {
    document.documentElement.dataset.motion = full ? 'full' : 'base'
  }, [full])

  return <MotionDoseContext.Provider value={full ? 'full' : 'base'}>{children}</MotionDoseContext.Provider>
}

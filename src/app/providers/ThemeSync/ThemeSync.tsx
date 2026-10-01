import { useEffect } from 'react'
import { findCity } from '../../../data'
import { MINUTE_MS, useNow } from '../../../hooks'
import { getSeason } from '../../../lib'
import { useDailyStore, useShopStore } from '../../../store'

export const ThemeSync = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const themeMode = useDailyStore((state) => state.themeMode)
  const themePalette = useDailyStore((state) => state.themePalette)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const now = useNow(MINUTE_MS)
  const autoSeason = getSeason(now, findCity(cityId).timezone)
  const season = themePalette && themePalette !== 'auto' ? themePalette : autoSeason

  useEffect(() => {
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    }

    const applyTheme = () => {
      const mode = themeMode ?? 'system'
      const effective = mode === 'system' ? getSystemTheme() : mode
      document.documentElement.dataset.theme = `${season}-${effective}`
      document.documentElement.dataset.themeMode = effective

      if (activeThemeSkin && activeThemeSkin !== 'default') {
        document.documentElement.dataset.themeOverride = activeThemeSkin
      } else {
        delete document.documentElement.dataset.themeOverride
      }
    }

    applyTheme()

    if ((themeMode ?? 'system') === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: light)')
      const listener = () => applyTheme()
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [season, themeMode, activeThemeSkin])

  return null
}

import { useEffect } from 'react'
import { isBasePalette } from '../../../lib'
import { useDailyStore, useShopStore, useViewModeStore } from '../../../store'

export const ThemeSync = () => {
  const themeMode = useDailyStore((state) => state.themeMode)
  const storedPalette = useDailyStore((state) => state.themePalette)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const cornerStyle = useViewModeStore((state) => state.cornerStyle ?? 'middle')
  const themePalette = isBasePalette(storedPalette) ? storedPalette : 'graphite'

  useEffect(() => {
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    }

    const applyTheme = () => {
      const mode = themeMode ?? 'system'
      const effective = mode === 'system' ? getSystemTheme() : mode
      document.documentElement.dataset.theme = `${themePalette}-${effective}`
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
  }, [themePalette, themeMode, activeThemeSkin])

  useEffect(() => {
    document.documentElement.dataset.corner = cornerStyle
  }, [cornerStyle])

  return null
}

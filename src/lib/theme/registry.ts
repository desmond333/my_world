import type { ThemePaletteId } from '../../data'
import { THEME_PALETTES, VIP_THEMES, type ThemePalettePreview } from './palettes'

export type ThemeEntry = {
  id: string
  kind: 'palette' | 'vip'
  nameKey: string
  fallback: string
  preview: ThemePalettePreview
  paletteId?: ThemePaletteId
  shopKey?: string
  price?: number
}

export const THEME_REGISTRY: ThemeEntry[] = [
  ...THEME_PALETTES.map((palette) => ({
    id: palette.id,
    kind: 'palette' as const,
    nameKey: palette.nameKey,
    fallback: palette.fallback,
    preview: palette.preview,
    paletteId: palette.id,
  })),
  ...VIP_THEMES.map((vip) => ({
    id: vip.skin,
    kind: 'vip' as const,
    nameKey: vip.nameKey,
    fallback: vip.fallback,
    preview: vip.preview,
    shopKey: vip.shopKey,
    price: vip.price,
  })),
]

export const getTheme = (id: string): ThemeEntry | undefined => THEME_REGISTRY.find((theme) => theme.id === id)

export const isBasePalette = (id: string): id is ThemePaletteId => THEME_PALETTES.some((palette) => palette.id === id)

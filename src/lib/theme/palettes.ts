import type { ThemePaletteId } from '../../data'

export type ThemePalettePreview = {
  light: { bg: string; accent: string }
  dark: { bg: string; accent: string }
}

export type ThemePaletteOption = {
  id: ThemePaletteId
  nameKey: string
  fallback: string
  hintKey?: string
  hintFallback?: string
  preview: ThemePalettePreview
}

export const THEME_PALETTES: ThemePaletteOption[] = [
  {
    id: 'auto',
    nameKey: 'settings.theme.auto',
    fallback: 'Авто',
    hintKey: 'settings.theme.autoHint',
    hintFallback: 'по сезону и городу',
    preview: {
      light: { bg: '#f7f3ea', accent: '#b86208' },
      dark: { bg: '#151717', accent: '#f4b849' },
    },
  },
  {
    id: 'spring',
    nameKey: 'settings.theme.spring',
    fallback: 'Весна',
    preview: {
      light: { bg: '#f3f6ee', accent: '#337a28' },
      dark: { bg: '#14201e', accent: '#b4d77e' },
    },
  },
  {
    id: 'summer',
    nameKey: 'settings.theme.summer',
    fallback: 'Лето',
    preview: {
      light: { bg: '#f4f6f4', accent: '#b46b0a' },
      dark: { bg: '#12202b', accent: '#f0c66b' },
    },
  },
  {
    id: 'autumn',
    nameKey: 'settings.theme.autumn',
    fallback: 'Осень',
    preview: {
      light: { bg: '#f7f3ea', accent: '#b86208' },
      dark: { bg: '#151717', accent: '#f4b849' },
    },
  },
  {
    id: 'winter',
    nameKey: 'settings.theme.winter',
    fallback: 'Зима',
    preview: {
      light: { bg: '#f3f6fa', accent: '#2f6fbd' },
      dark: { bg: '#1b2333', accent: '#f2c879' },
    },
  },
  {
    id: 'nord',
    nameKey: 'settings.theme.nord',
    fallback: 'Nord',
    hintKey: 'settings.theme.nordHint',
    hintFallback: 'арктическая сдержанность',
    preview: {
      light: { bg: '#eceff4', accent: '#5e81ac' },
      dark: { bg: '#2e3440', accent: '#88c0d0' },
    },
  },
  {
    id: 'solarized',
    nameKey: 'settings.theme.solarized',
    fallback: 'Solarized',
    hintKey: 'settings.theme.solarizedHint',
    hintFallback: 'тёплая классика',
    preview: {
      light: { bg: '#fdf6e3', accent: '#268bd2' },
      dark: { bg: '#002b36', accent: '#b58900' },
    },
  },
]

export type VipThemeOption = {
  skin: string
  shopKey: string
  price: number
  nameKey: string
  fallback: string
  preview: ThemePalettePreview
}

export const VIP_THEMES: VipThemeOption[] = [
  {
    skin: 'cyberpunk',
    shopKey: 'theme_cyberpunk',
    price: 150,
    nameKey: 'settings.theme.cyberpunk',
    fallback: 'Киберпанк',
    preview: {
      light: { bg: '#f1f6fc', accent: '#0077b6' },
      dark: { bg: '#090a14', accent: '#00f2fe' },
    },
  },
  {
    skin: 'midnight_gold',
    shopKey: 'theme_midnight_gold',
    price: 150,
    nameKey: 'settings.theme.midnightGold',
    fallback: 'Полночное золото',
    preview: {
      light: { bg: '#faf6ed', accent: '#b38206' },
      dark: { bg: '#0d0c0a', accent: '#ffd700' },
    },
  },
]

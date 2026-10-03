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
    id: 'graphite',
    nameKey: 'settings.theme.graphite',
    fallback: 'Графит',
    hintKey: 'settings.theme.graphiteHint',
    hintFallback: 'строгий монохром',
    preview: {
      light: { bg: '#ffffff', accent: '#1f2328' },
      dark: { bg: '#0d1117', accent: '#e6edf3' },
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
  icon: string
  boxClass: string
  titleKey: string
  titleFallback: string
  descKey: string
  descFallback: string
  preview: ThemePalettePreview
  secondary: { light: string; dark: string }
}

export const VIP_THEMES: VipThemeOption[] = [
  {
    skin: 'spring',
    shopKey: 'theme_spring',
    price: 150,
    nameKey: 'settings.theme.spring',
    fallback: 'Весна',
    icon: 'leaf',
    boxClass: 'box-spring',
    titleKey: 'shop.theme-spring',
    titleFallback: 'Свежая Весна',
    descKey: 'shop.theme-spring-desc',
    descFallback: 'Двойная тема. Нежная зелень и мягкий свет в светлом режиме, глубокая хвоя с ростками в тёмном.',
    preview: {
      light: { bg: '#f3f6ee', accent: '#337a28' },
      dark: { bg: '#14201e', accent: '#b4d77e' },
    },
    secondary: { light: '#7fb069', dark: '#5fa8d3' },
  },
  {
    skin: 'summer',
    shopKey: 'theme_summer',
    price: 150,
    nameKey: 'settings.theme.summer',
    fallback: 'Лето',
    icon: 'sun',
    boxClass: 'box-summer',
    titleKey: 'shop.theme-summer',
    titleFallback: 'Тёплое Лето',
    descKey: 'shop.theme-summer-desc',
    descFallback: 'Двойная тема. Солнечный янтарь и небо в светлом режиме, тёплые сумерки у моря в тёмном.',
    preview: {
      light: { bg: '#f4f6f4', accent: '#b46b0a' },
      dark: { bg: '#12202b', accent: '#f0c66b' },
    },
    secondary: { light: '#e08d1a', dark: '#ff8f5e' },
  },
  {
    skin: 'autumn',
    shopKey: 'theme_autumn',
    price: 150,
    nameKey: 'settings.theme.autumn',
    fallback: 'Осень',
    icon: 'leaf',
    boxClass: 'box-autumn',
    titleKey: 'shop.theme-autumn',
    titleFallback: 'Тёплая Осень',
    descKey: 'shop.theme-autumn-desc',
    descFallback: 'Двойная тема. Янтарная листва и уютный свет в светлом режиме, тёплые сумерки с золотом в тёмном.',
    preview: {
      light: { bg: '#f7f3ea', accent: '#b86208' },
      dark: { bg: '#151717', accent: '#f4b849' },
    },
    secondary: { light: '#c9835a', dark: '#e57450' },
  },
  {
    skin: 'winter',
    shopKey: 'theme_winter',
    price: 150,
    nameKey: 'settings.theme.winter',
    fallback: 'Зима',
    icon: 'snowflake',
    boxClass: 'box-winter',
    titleKey: 'shop.theme-winter',
    titleFallback: 'Ясная Зима',
    descKey: 'shop.theme-winter-desc',
    descFallback: 'Двойная тема. Морозное небо и льдистый синий в светлом режиме, ночная синь со звёздами в тёмном.',
    preview: {
      light: { bg: '#f3f6fa', accent: '#2f6fbd' },
      dark: { bg: '#1b2333', accent: '#f2c879' },
    },
    secondary: { light: '#7fb0e0', dark: '#9db8e8' },
  },
  {
    skin: 'cyberpunk',
    shopKey: 'theme_cyberpunk',
    price: 150,
    nameKey: 'settings.theme.cyberpunk',
    fallback: 'Киберпанк',
    icon: 'zap',
    boxClass: 'box-cyber',
    titleKey: 'shop.neon-cyberpunk',
    titleFallback: 'Неоновый Киберпанк',
    descKey: 'shop.dual-theme-adapts-to-light-dark-modes-clean-ice-',
    descFallback: 'Двойная тема. Ледяной кибер-фон со светящимся цианом в светлом режиме и глубокий сапфир с неоном в тёмном.',
    preview: {
      light: { bg: '#f1f6fc', accent: '#0077b6' },
      dark: { bg: '#090a14', accent: '#00f2fe' },
    },
    secondary: { light: '#d40066', dark: '#ff007f' },
  },
  {
    skin: 'midnight_gold',
    shopKey: 'theme_midnight_gold',
    price: 150,
    nameKey: 'settings.theme.midnightGold',
    fallback: 'Полночное золото',
    icon: 'crown',
    boxClass: 'box-gold',
    titleKey: 'shop.midnight-gold',
    titleFallback: 'Королевское Золото',
    descKey: 'shop.dual-theme-adapts-to-light-dark-modes-regal-cham',
    descFallback: 'Двойная тема. Благородная слоновая кость в светлом режиме и обсидиановый фон с золотым тиснением в тёмном.',
    preview: {
      light: { bg: '#faf6ed', accent: '#b38206' },
      dark: { bg: '#0d0c0a', accent: '#ffd700' },
    },
    secondary: { light: '#c0631c', dark: '#e5a93c' },
  },
  {
    skin: 'violet',
    shopKey: 'theme_violet',
    price: 180,
    nameKey: 'settings.theme.violet',
    fallback: 'Фиалка',
    icon: 'wand',
    boxClass: 'box-violet',
    titleKey: 'shop.theme-violet',
    titleFallback: 'Ночная Фиалка',
    descKey: 'shop.theme-violet-desc',
    descFallback: 'Двойная тема. Лавандовое сияние и мягкий сиреневый в светлом режиме, глубокий аметист со светом неона в тёмном.',
    preview: {
      light: { bg: '#f6f2ff', accent: '#6d28d9' },
      dark: { bg: '#140b26', accent: '#a78bfa' },
    },
    secondary: { light: '#a855f7', dark: '#e879f9' },
  },
  {
    skin: 'anime',
    shopKey: 'theme_anime',
    price: 200,
    nameKey: 'settings.theme.anime',
    fallback: 'Аниме',
    icon: 'heart',
    boxClass: 'box-anime',
    titleKey: 'shop.theme-anime',
    titleFallback: 'Розовый Аниме',
    descKey: 'shop.theme-anime-desc',
    descFallback: 'Двойная тема. Воздушная сакура и ванильный фон в светлом режиме, ночной неон и малиновый акцент в тёмном.',
    preview: {
      light: { bg: '#fff0f7', accent: '#d6338a' },
      dark: { bg: '#1a0f1f', accent: '#ff6fb5' },
    },
    secondary: { light: '#8b5cf6', dark: '#63e6ff' },
  },
]

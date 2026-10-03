export type ShopItemKey =
  | 'lottery'
  | 'statham'
  | 'cat_wizard'
  | 'cat_cyber'
  | 'theme_spring'
  | 'theme_summer'
  | 'theme_autumn'
  | 'theme_winter'
  | 'theme_cyberpunk'
  | 'theme_midnight_gold'
  | 'theme_violet'
  | 'theme_anime'
  | 'sound_lofi'
  | 'lang_advanced'
  | 'notes_advanced'
  | 'view_normal'
  | 'finance_advice'
  | 'motion_pro'

export type CatSkinId = 'classic' | 'wizard' | 'cyber'
export type ThemeSkinId = 'default' | 'spring' | 'summer' | 'autumn' | 'winter' | 'cyberpunk' | 'midnight_gold' | 'violet' | 'anime'

export const VIP_THEME_SKINS: ThemeSkinId[] = ['spring', 'summer', 'autumn', 'winter', 'cyberpunk', 'midnight_gold', 'violet', 'anime']

export const PART_PRICES: Record<ShopItemKey, number> = {
  lottery: 250,
  statham: 250,
  cat_wizard: 200,
  cat_cyber: 200,
  theme_spring: 150,
  theme_summer: 150,
  theme_autumn: 150,
  theme_winter: 150,
  theme_cyberpunk: 150,
  theme_midnight_gold: 150,
  theme_violet: 180,
  theme_anime: 200,
  sound_lofi: 200,
  lang_advanced: 800,
  notes_advanced: 600,
  view_normal: 400,
  finance_advice: 700,
  motion_pro: 500,
}

export const themeSkinToShopKey = (theme: ThemeSkinId): ShopItemKey | null => {
  if (theme === 'default') return null
  return `theme_${theme}` as ShopItemKey
}

export const catSkinToShopKey = (skin: CatSkinId): ShopItemKey | null => {
  if (skin === 'classic') return null
  return skin === 'wizard' ? 'cat_wizard' : 'cat_cyber'
}

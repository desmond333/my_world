export const SHOP_PART_PRICES = {
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
} as const

export type ShopPartKey = keyof typeof SHOP_PART_PRICES

export const isShopPartKey = (value: string): value is ShopPartKey => Object.prototype.hasOwnProperty.call(SHOP_PART_PRICES, value)

export type EarnRule = { min: number; max: number; dailyCap: number }

export const EARN_RULES: Record<string, EarnRule> = {
  task: { min: 10, max: 10, dailyCap: 300 },
  goal: { min: 100, max: 100, dailyCap: 1000 },
  dream: { min: 1000, max: 1000, dailyCap: 5000 },
  greeting: { min: 100, max: 100, dailyCap: 200 },
  battle: { min: 35, max: 65, dailyCap: 1000 },
}

export const isValidEarn = (reason: string, amount: number): boolean => {
  const rule = EARN_RULES[reason]
  if (!rule) return false
  if (!Number.isFinite(amount)) return false
  return amount >= rule.min && amount <= rule.max
}

export const earnDailyCap = (reason: string): number => EARN_RULES[reason]?.dailyCap ?? 0

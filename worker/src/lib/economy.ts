export const SHOP_PART_PRICES = {
  lottery: 250,
  statham: 250,
  cat_wizard: 200,
  cat_cyber: 200,
  theme_cyberpunk: 150,
  theme_midnight_gold: 150,
  sound_lofi: 200,
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
  'pack-500': { min: 500, max: 500, dailyCap: 100000 },
  'pack-2500': { min: 2500, max: 2500, dailyCap: 100000 },
  'pack-10000': { min: 10000, max: 10000, dailyCap: 100000 },
}

export const isValidEarn = (reason: string, amount: number): boolean => {
  const rule = EARN_RULES[reason]
  if (!rule) return false
  if (!Number.isFinite(amount)) return false
  return amount >= rule.min && amount <= rule.max
}

export const earnDailyCap = (reason: string): number => EARN_RULES[reason]?.dailyCap ?? 0

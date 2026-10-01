export type PremiumState = {
  isPremium?: number | boolean | null
  premiumUntil?: string | null
}

export const isPremiumActive = (state: PremiumState, nowIso: string): boolean => {
  if (state.isPremium) return true
  if (!state.premiumUntil) return false
  return state.premiumUntil > nowIso
}

export const addMonths = (fromIso: string, months: number): string => {
  const date = new Date(fromIso)
  const day = date.getUTCDate()
  date.setUTCMonth(date.getUTCMonth() + months)
  // если день «перескочил» из-за короткого месяца — откатываем к последнему дню
  if (date.getUTCDate() < day) date.setUTCDate(0)
  return date.toISOString()
}

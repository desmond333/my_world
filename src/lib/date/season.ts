import { getTranslation } from '../i18n'

export const getSeason = (date: Date, timezone: string) => {
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'numeric' }).format(date))
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export const seasonName = (season: string, lang: 'ru' | 'en' = 'ru') => getTranslation(`season.name.${season}`, lang, season)

export const seasonPhrase = (season: string, lang: 'ru' | 'en' = 'ru') => getTranslation(`season.phrase.${season}`, lang, season)

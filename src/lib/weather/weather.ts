import { getTranslation, type Lang } from '../i18n'

const WEATHER_KEYS: [number, string][] = [
  [0, 'weather.code.clear'],
  [2, 'weather.code.partly'],
  [3, 'weather.code.cloudy'],
  [48, 'weather.code.fog'],
  [57, 'weather.code.drizzle'],
  [67, 'weather.code.rain'],
  [77, 'weather.code.snow'],
  [82, 'weather.showers'],
  [86, 'weather.snowfall'],
]

const WEATHER_FALLBACK: [number, string][] = [
  [0, 'Ясно'],
  [2, 'Переменная облачность'],
  [3, 'Облачно'],
  [48, 'Туман'],
  [57, 'Морось'],
  [67, 'Дождь'],
  [77, 'Снег'],
  [82, 'Ливни'],
  [86, 'Снегопад'],
]

export const weatherLabel = (code: number, lang: Lang = 'ru') => {
  const entry = WEATHER_KEYS.find(([max]) => code <= max)
  const fallbackEntry = WEATHER_FALLBACK.find(([max]) => code <= max)
  return getTranslation(entry?.[1] ?? 'weather.code.thunder', lang, fallbackEntry?.[1])
}

export type TempScaleBand = {
  id: string
  labelRu: string
  labelEn: string
  color: string
}

export const TEMP_BANDS: TempScaleBand[] = [
  { id: 'subzero', labelRu: '< 0°', labelEn: '< 0°', color: '#60a5fa' },
  { id: 'cold', labelRu: '0..5°', labelEn: '0..5°', color: '#38bdf8' },
  { id: 'chilly', labelRu: '6..11°', labelEn: '6..11°', color: '#2dd4bf' },
  { id: 'mild', labelRu: '12..17°', labelEn: '12..17°', color: '#4ade80' },
  { id: 'warm', labelRu: '18..23°', labelEn: '18..23°', color: '#f4b849' },
  { id: 'hot', labelRu: '24..29°', labelEn: '24..29°', color: '#e57450' },
  { id: 'heatwave', labelRu: '30°+', labelEn: '30°+', color: '#ef4444' },
]

export const getTemperatureColor = (temperature: number): string => {
  if (temperature >= 30) return '#ef4444'
  if (temperature >= 24) return '#e57450'
  if (temperature >= 18) return '#f4b849'
  if (temperature >= 12) return '#4ade80'
  if (temperature >= 6) return '#2dd4bf'
  if (temperature >= 0) return '#38bdf8'
  return '#60a5fa'
}

export const isRainyDay = (code: number): boolean => {
  return (code >= 61 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

export type DaySpecialEvent = {
  type: 'own-birthday' | 'birthday' | 'holiday'
  titleKey: string
  titleFallback: string
  titleParams?: Record<string, string | number>
  kind: 'cake' | 'gift' | 'flower' | 'shield' | 'star' | 'sparkles'
}

export const getDaySpecialEvent = (
  dateStr: string,
  ownBirthday?: string,
  birthdays?: { name: string; date: string }[],
): DaySpecialEvent | null => {
  const mmdd = dateStr.slice(5)

  if (ownBirthday && ownBirthday.slice(5) === mmdd) {
    return {
      type: 'own-birthday',
      titleKey: 'weather.event.ownBirthday',
      titleFallback: 'Мой день рождения! 🎂',
      kind: 'cake',
    }
  }

  if (birthdays && birthdays.length > 0) {
    const found = birthdays.find((b) => b.date && b.date.slice(5) === mmdd)
    if (found) {
      return {
        type: 'birthday',
        titleKey: 'weather.event.birthday',
        titleFallback: `День рождения: ${found.name} 🎂`,
        titleParams: { name: found.name },
        kind: 'cake',
      }
    }
  }

  if (mmdd === '01-01') {
    return {
      type: 'holiday',
      titleKey: 'weather.event.newYear',
      titleFallback: 'Новый год! 🎄',
      kind: 'sparkles',
    }
  }
  if (mmdd === '12-31') {
    return {
      type: 'holiday',
      titleKey: 'weather.event.newYearEve',
      titleFallback: 'Канун Нового года! ✨',
      kind: 'sparkles',
    }
  }
  if (mmdd === '02-23') {
    return {
      type: 'holiday',
      titleKey: 'weather.event.defender',
      titleFallback: '23 февраля — День защитника Отечества ⭐',
      kind: 'shield',
    }
  }
  if (mmdd === '03-08') {
    return {
      type: 'holiday',
      titleKey: 'weather.event.women',
      titleFallback: '8 марта — Международный женский день 🌸',
      kind: 'flower',
    }
  }
  if (mmdd === '05-09') {
    return {
      type: 'holiday',
      titleKey: 'weather.event.victory',
      titleFallback: '9 мая — День Победы ⭐',
      kind: 'star',
    }
  }

  return null
}

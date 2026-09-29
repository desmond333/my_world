import { getTranslation, type Lang } from './i18n'

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

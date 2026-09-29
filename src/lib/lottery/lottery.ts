import { getTranslation, localeOf, type Lang } from '../i18n'

export type LotteryVariant = {
  id: string
  label: string
  hint: string
  chance: number
  prize: number
  ticket: number
  comment: string
}

export const LOTTERY_VARIANTS: LotteryVariant[] = [
  {
    id: 'one-of-hundred',
    label: 'Лотерея 1 из 100',
    hint: 'шанс 1%',
    chance: 0.01,
    prize: 100_000,
    ticket: 100,
    comment: 'Приз заоблачный, а шанс такой, что его почти не обойти. Хорошее начало, чтобы понять остальные.',
  },
  {
    id: 'six-of-forty-five',
    label: 'Лотерея 6 из 45',
    hint: 'шанс 0,0000123%',
    chance: 1 / 8_145_060,
    prize: 300_000_000,
    ticket: 45,
    comment: 'Классика: нужно угадать шесть чисел из сорока пяти. Джекпот огромный, но и шанс соответствующий.',
  },
  {
    id: 'coin',
    label: 'Монетка',
    hint: 'шанс 50%',
    chance: 0.5,
    prize: 2_000,
    ticket: 1,
    comment: 'Самый щедрый по вероятности вариант. Выигрыш почти на каждом втором броске, но приз маленький.',
  },
]

export const DEFAULT_VARIANT_ID = 'one-of-hundred'

export const findVariant = (id: string) => LOTTERY_VARIANTS.find((variant) => variant.id === id) ?? LOTTERY_VARIANTS[0]

const percent = (chance: number, locale: string) => {
  const value = chance * 100
  if (value >= 0.001) return value.toLocaleString(locale, { maximumFractionDigits: 4 })
  return value.toLocaleString(locale, { maximumFractionDigits: 8 })
}

export const chanceText = (variant: LotteryVariant, lang: Lang = 'ru') => `${percent(variant.chance, localeOf(lang))}%`

export const oddsText = (variant: LotteryVariant, lang: Lang = 'ru') => {
  const one = 1 / variant.chance
  if (one < 1.5) return getTranslation('lottery.oddsEverySecond', lang)
  return getTranslation('lottery.oddsOneOf', lang, undefined, { count: Math.round(one) })
}

export const prizeText = (prize: number, lang: Lang = 'ru') => {
  const locale = localeOf(lang)
  if (prize >= 1_000_000) {
    return `${(prize / 1_000_000).toLocaleString(locale)} ${getTranslation('lottery.million', lang)}`
  }
  return `${prize.toLocaleString(locale)} ₽`
}

export const draw = (variant: LotteryVariant) => Math.random() < variant.chance

export const sectorAngle = (variant: LotteryVariant) => Math.max(variant.chance * 360, 0.4)

export const landingAngle = (variant: LotteryVariant, won: boolean) => {
  const win = sectorAngle(variant)
  const offset = won ? win / 2 : win + (360 - win) / 2
  const jitter = won ? win * 0.7 : Math.max(360 - win, 0.4) * 0.7
  return 360 * 6 + offset + Math.random() * jitter
}

export const expectedWins = (variant: LotteryVariant, spins: number) => variant.chance * spins

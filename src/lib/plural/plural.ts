import type { Lang } from '../i18n/types'
import { localeOf } from '../i18n/locale'

export type PluralSuffix = 'one' | 'few' | 'many'

const SUFFIX: Record<Intl.LDMLPluralRule, PluralSuffix> = {
  one: 'one',
  few: 'few',
  many: 'many',
  two: 'few',
  zero: 'many',
  other: 'many',
}

export const pluralForm = (value: number, lang: Lang = 'ru'): PluralSuffix =>
  SUFFIX[new Intl.PluralRules(localeOf(lang)).select(value)] ?? 'many'

export const plural = (value: number, forms: [string, string, string], lang: Lang = 'ru') => {
  const form = pluralForm(value, lang)
  return form === 'one' ? forms[0] : form === 'few' ? forms[1] : forms[2]
}

export const withCount = (value: number, forms: [string, string, string], lang: Lang = 'ru') => `${value} ${plural(value, forms, lang)}`

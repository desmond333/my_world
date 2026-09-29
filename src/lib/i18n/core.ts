import { useCallback, useMemo } from 'react'
import type { Dictionary, Lang, Translations } from './types'
import { nav } from './nav'
import { daily } from './daily'
import { training } from './training'
import { finance } from './finance'
import { productivity } from './productivity'
import { media } from './media'
import { subscriptions } from './subscriptions'
import { languages } from './languages'
import { fun } from './fun'
import { plural } from '../plural'
import { useDailyStore } from '../../store'

const DICTIONARIES: Dictionary[] = [nav, daily, training, finance, productivity, media, subscriptions, languages, fun]

const merge = (lang: Lang): Translations => Object.assign({}, ...DICTIONARIES.map((item) => item[lang]))

export const translations: Record<Lang, Translations> = {
  ru: merge('ru'),
  en: merge('en'),
}

export const DEFAULT_LANG: Lang = 'ru'

export const localeOf = (lang: Lang = DEFAULT_LANG) => (lang === 'en' ? 'en-US' : 'ru-RU')

export const getTranslation = (
  key: string,
  lang: Lang = DEFAULT_LANG,
  fallback?: string,
  values?: Record<string, string | number>,
): string => {
  const template = translations[lang]?.[key] ?? fallback ?? translations.ru[key] ?? key
  return values ? formatText(template, values) : template
}

export const formatText = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match))

const FORMS: [string, string, string] = ['one', 'few', 'many']

export const pluralKey = (key: string, count: number) => `${key}.${plural(count, FORMS)}`

export const countText = (key: string, count: number, lang: Lang = DEFAULT_LANG) =>
  `${count} ${getTranslation(pluralKey(key, count), lang)}`

export const useTranslation = () => {
  const lang = useDailyStore((state) => state.lang ?? DEFAULT_LANG)
  const setLang = useDailyStore((state) => state.setLang)
  const toggleLang = useDailyStore((state) => state.toggleLang)

  const t = useCallback(
    (key: string, fallback?: string, values?: Record<string, string | number>): string => {
      const template = getTranslation(key, lang, fallback)
      return values ? formatText(template, values) : template
    },
    [lang],
  )

  const locale = useMemo(() => localeOf(lang), [lang])

  return { lang, setLang, toggleLang, t, locale }
}

export type { Lang } from './types'

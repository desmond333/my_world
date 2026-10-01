import { useCallback, useMemo } from 'react'
import type { Dictionary, Lang, Translations } from './types'
import { DEFAULT_LANG } from './types'
import { useLang } from './LangContext'
import { localeOf } from './locale'
import { nav } from './nav'
import { daily } from './daily'
import { training } from './training'
import { finance } from './finance'
import { productivity } from './productivity'
import { media } from './media'
import { subscriptions } from './subscriptions'
import { languages } from './languages'
import { fun } from './fun'
import { cat } from './cat'
import { settings } from './settings'
import { friends } from './friends'
import { together } from './together'
import { help } from './help'
import { auth } from './auth'
import { admin } from './admin'
import { shop } from './shop'
import { notesHelp } from './notesHelp'
import { lotteryBattle } from './lotteryBattle'
import { lottery } from './lottery'
import { season } from './season'
import { premium } from './premium'
import { pluralForm } from '../plural'

const DICTIONARIES: Dictionary[] = [
  nav,
  daily,
  training,
  finance,
  productivity,
  media,
  subscriptions,
  languages,
  fun,
  cat,
  settings,
  friends,
  together,
  help,
  premium,
  auth,
  admin,
  shop,
  notesHelp,
  lotteryBattle,
  lottery,
  season,
]

const merge = (lang: Lang): Translations => Object.assign({}, ...DICTIONARIES.map((item) => item[lang] ?? {}))

export const translations: Record<Lang, Translations> = {
  ru: merge('ru'),
  en: merge('en'),
}

export { DEFAULT_LANG } from './types'
export { localeOf } from './locale'

export const getTranslation = (
  key: string,
  lang: Lang = DEFAULT_LANG,
  fallback?: string,
  values?: Record<string, string | number>,
): string => {
  const template = translations[lang]?.[key] ?? translations.ru[key] ?? fallback ?? key
  return values ? formatText(template, values) : template
}

export const formatText = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match))

export const pluralKey = (key: string, count: number, lang: Lang = DEFAULT_LANG) => `${key}.${pluralForm(count, lang)}`

export const countText = (key: string, count: number, lang: Lang = DEFAULT_LANG) =>
  `${count} ${getTranslation(pluralKey(key, count, lang), lang)}`

export const useTranslation = () => {
  const { lang, setLang, toggleLang } = useLang()

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

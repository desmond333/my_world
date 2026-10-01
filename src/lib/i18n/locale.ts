import { DEFAULT_LANG, type Lang } from './types'

const LOCALES: Record<Lang, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

export const localeOf = (lang: Lang = DEFAULT_LANG): string => LOCALES[lang] ?? LOCALES.ru

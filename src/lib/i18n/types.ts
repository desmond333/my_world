export type Lang = 'ru' | 'en'

export const DEFAULT_LANG: Lang = 'ru'

export type Translations = Record<string, string>

export type Dictionary = Partial<Record<Lang, Translations>>

export type TFn = (key: string, fallback?: string, values?: Record<string, string | number>) => string

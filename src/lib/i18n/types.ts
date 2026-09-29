export type Lang = 'ru' | 'en'

export type Translations = Record<string, string>

export type Dictionary = Record<Lang, Translations>

export type TFn = (key: string, fallback?: string, values?: Record<string, string | number>) => string

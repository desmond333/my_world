import { createContext, useContext } from 'react'
import { DEFAULT_LANG, type Lang } from './types'

export type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

export const LangContext = createContext<LangContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => undefined,
  toggleLang: () => undefined,
})

export const useLang = () => useContext(LangContext)

import { useMemo, type ReactNode } from 'react'
import { LangContext } from './LangContext'
import type { Lang } from './types'

export type LangProviderProps = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  children: ReactNode
}

export const LangProvider = ({ lang, setLang, toggleLang, children }: LangProviderProps) => {
  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang, setLang, toggleLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

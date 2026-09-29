import { BookOpen, Gamepad2, Clapperboard } from 'lucide-react'
import type { SectionTab } from '../../../components/SectionTabs/SectionTabs'
import { getTranslation, type Lang } from '../../../lib/i18n'

export type MediaTabKey = 'movies' | 'books' | 'games'

export type MediaTab = {
  key: MediaTabKey
  label: string
  hint: string
  icon: typeof Clapperboard
}

export const mediaTabs: MediaTab[] = [
  { key: 'movies', label: 'Фильмы', hint: 'поиск и списки', icon: Clapperboard },
  { key: 'books', label: 'Книги', hint: 'поиск и списки', icon: BookOpen },
  { key: 'games', label: 'Игры', hint: 'поиск и списки', icon: Gamepad2 },
]

export const isMediaTab = (value: string): value is MediaTabKey => mediaTabs.some((tab) => tab.key === value)

export const DEFAULT_MEDIA_TAB: MediaTabKey = 'movies'

export const toMediaTab = (tab: MediaTab, lang: Lang): SectionTab => ({
  to: `/extra/media/${tab.key}`,
  label: getTranslation(`media.tab.${tab.key}`, lang, tab.label),
  hint: getTranslation(`media.tab.${tab.key}Hint`, lang, tab.hint),
  icon: tab.icon,
})

import { BookOpen, Gamepad2, Clapperboard } from 'lucide-react'
import type { SectionTab } from '../../../components/SectionTabs/SectionTabs'

export type MediaTabKey = 'movies' | 'books' | 'games'

export type MediaTab = {
  key: MediaTabKey
  label: string
  hint: string
  icon: typeof Clapperboard
}

export const mediaTabs: MediaTab[] = [
  { key: 'movies', label: 'Фильмы', hint: 'поиск и списки', icon: Clapperboard },
  { key: 'books', label: 'Книги', hint: 'скоро', icon: BookOpen },
  { key: 'games', label: 'Игры', hint: 'скоро', icon: Gamepad2 },
]

export const isMediaTab = (value: string): value is MediaTabKey => mediaTabs.some((tab) => tab.key === value)

export const DEFAULT_MEDIA_TAB: MediaTabKey = 'movies'

export const toMediaTab = (tab: MediaTab): SectionTab => ({
  to: `/extra/media/${tab.key}`,
  label: tab.label,
  hint: tab.hint,
  icon: tab.icon,
})

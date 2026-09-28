import type { LucideIcon } from 'lucide-react'
import { Clapperboard, Coins, Dumbbell, Target, Ticket, Wallet } from 'lucide-react'

export type ExtraSectionKey = 'training' | 'finance' | 'productivity' | 'media' | 'subscriptions' | 'lottery'

export type ExtraSection = {
  key: ExtraSectionKey
  label: string
  hint: string
  icon: LucideIcon
}

export const extraSections: ExtraSection[] = [
  { key: 'training', label: 'Тренировки', hint: 'календарь и виды спорта', icon: Dumbbell },
  { key: 'finance', label: 'Финансы', hint: 'деньги и бюджет', icon: Coins },
  { key: 'subscriptions', label: 'Подписки', hint: 'до когда платить', icon: Wallet },
  { key: 'productivity', label: 'Продуктивность', hint: 'планы и привычки', icon: Target },
  { key: 'media', label: 'Медиа', hint: 'фильмы, книги и игры', icon: Clapperboard },
  { key: 'lottery', label: 'Лотерея', hint: 'испытай удачу', icon: Ticket },
]

export const DEFAULT_EXTRA_SECTION: ExtraSectionKey = 'training'

export const isExtraSection = (value: string): value is ExtraSectionKey => extraSections.some((section) => section.key === value)

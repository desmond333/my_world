import type { LucideIcon } from 'lucide-react'
import { Bell, Clapperboard, Coins, Dumbbell, Languages, Laugh, Moon, Target, Ticket } from 'lucide-react'

export type UsefulSectionKey = 'training' | 'finance' | 'productivity' | 'mind' | 'remind' | 'media'
export type MiscSectionKey = 'languages' | 'fun' | 'clowns' | 'lottery' | 'georgian'
export type ExtraSectionKey = UsefulSectionKey | MiscSectionKey

export type ExtraSection<T extends string = ExtraSectionKey> = {
  key: T
  label: string
  hint: string
  icon: LucideIcon
}

export const usefulSections: ExtraSection<UsefulSectionKey>[] = [
  { key: 'training', label: 'Тренировки', hint: 'календарь и виды спорта', icon: Dumbbell },
  { key: 'finance', label: 'Финансы', hint: 'доходы, вклады и кредиты', icon: Coins },
  { key: 'productivity', label: 'Продуктивность', hint: 'планы и привычки', icon: Target },
  { key: 'mind', label: 'Дневник', hint: 'сны и настроение', icon: Moon },
  { key: 'remind', label: 'Напомнить', hint: 'дни рождения', icon: Bell },
  { key: 'media', label: 'Медиа', hint: 'фильмы, книги и игры', icon: Clapperboard },
]

export const miscSections: ExtraSection<MiscSectionKey>[] = [
  { key: 'languages', label: 'Языки', hint: 'английский и грузинский', icon: Languages },
  { key: 'fun', label: 'Веселье', hint: 'Стэйтем, лотерея и мемы', icon: Laugh },
  { key: 'lottery', label: 'Лотерея', hint: 'испытай удачу', icon: Ticket },
]

export const extraSections: ExtraSection[] = [...usefulSections, ...miscSections]

export const DEFAULT_USEFUL_SECTION: UsefulSectionKey = 'training'
export const DEFAULT_MISC_SECTION: MiscSectionKey = 'languages'
export const DEFAULT_EXTRA_SECTION: ExtraSectionKey = 'training'

export const isUsefulSection = (value: string): value is UsefulSectionKey => usefulSections.some((section) => section.key === value)

export const isMiscSection = (value: string): value is MiscSectionKey =>
  value === 'clowns' || miscSections.some((section) => section.key === value)

export const isExtraSection = (value: string): value is ExtraSectionKey => extraSections.some((section) => section.key === value)

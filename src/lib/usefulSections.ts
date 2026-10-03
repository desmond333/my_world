import type { LucideIcon } from 'lucide-react'
import { Bell, Clapperboard, Coins, Dumbbell, HeartHandshake, Languages, Laugh, Moon, Music, Target, Ticket } from 'lucide-react'

export type UsefulSectionKey =
  'training' | 'productivity' | 'mind' | 'remind' | 'finance' | 'media' | 'languages' | 'sounds' | 'fun' | 'lottery' | 'together'

export type UsefulSection = {
  key: UsefulSectionKey
  label: string
  hint: string
  icon: LucideIcon
}

export type UsefulSectionGroup = {
  id: string
  label: string
  items: UsefulSection[]
}

export const usefulSectionGroups: UsefulSectionGroup[] = [
  {
    id: 'planning',
    label: 'Планирование',
    items: [
      { key: 'training', label: 'Тренировки', hint: 'календарь и виды спорта', icon: Dumbbell },
      { key: 'productivity', label: 'Продуктивность', hint: 'планы и привычки', icon: Target },
      { key: 'mind', label: 'Дневник', hint: 'сны и настроение', icon: Moon },
    ],
  },
  {
    id: 'money',
    label: 'Финансы и обучение',
    items: [
      { key: 'finance', label: 'Финансы', hint: 'доходы, вклады и кредиты', icon: Coins },
      { key: 'languages', label: 'Языки', hint: 'английский и грузинский', icon: Languages },
    ],
  },
  {
    id: 'leisure',
    label: 'Досуг',
    items: [
      { key: 'media', label: 'Медиа', hint: 'фильмы, книги и игры', icon: Clapperboard },
      { key: 'fun', label: 'Веселье', hint: 'мемы и саундборд', icon: Laugh },
      { key: 'lottery', label: 'Лотерея', hint: 'испытай удачу', icon: Ticket },
      { key: 'together', label: 'Вместе', hint: 'общие окна времени', icon: HeartHandshake },
    ],
  },
  {
    id: 'misc',
    label: 'Разное',
    items: [
      { key: 'remind', label: 'Напомнить', hint: 'дни рождения', icon: Bell },
      { key: 'sounds', label: 'Звуки', hint: 'фоновые сцены для работы', icon: Music },
    ],
  },
]

export const usefulSections: UsefulSection[] = usefulSectionGroups.flatMap((group) => group.items)

export const DEFAULT_USEFUL_SECTION: UsefulSectionKey = 'training'

export const isUsefulSection = (value: string): value is UsefulSectionKey => usefulSections.some((section) => section.key === value)

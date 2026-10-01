import type { LucideIcon } from 'lucide-react'
import { CalendarHeart, Languages, Laugh, Ticket } from 'lucide-react'

export type MiscSectionKey = 'languages' | 'fun' | 'clowns' | 'lottery' | 'georgian' | 'together'

export type MiscSection = {
  key: MiscSectionKey
  label: string
  hint: string
  icon: LucideIcon
}

export const miscSections: MiscSection[] = [
  { key: 'together', label: 'Вместе', hint: 'общие окна времени', icon: CalendarHeart },
  { key: 'languages', label: 'Языки', hint: 'английский и грузинский', icon: Languages },
  { key: 'fun', label: 'Веселье', hint: 'Стэйтем, лотерея и мемы', icon: Laugh },
  { key: 'lottery', label: 'Лотерея', hint: 'испытай удачу', icon: Ticket },
]

export const DEFAULT_MISC_SECTION: MiscSectionKey = 'languages'

export const isMiscSection = (value: string): value is MiscSectionKey =>
  value === 'clowns' || miscSections.some((section) => section.key === value)

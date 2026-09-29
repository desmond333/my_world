import type { LucideIcon } from 'lucide-react'
import { Languages, Laugh, Ticket, Wallet } from 'lucide-react'

export type MiscSectionKey = 'subscriptions' | 'languages' | 'fun' | 'clowns' | 'lottery' | 'georgian'

export type MiscSection = {
  key: MiscSectionKey
  label: string
  hint: string
  icon: LucideIcon
}

export const miscSections: MiscSection[] = [
  { key: 'subscriptions', label: 'Подписки', hint: 'до когда платить', icon: Wallet },
  { key: 'languages', label: 'Языки', hint: 'английский и грузинский', icon: Languages },
  { key: 'fun', label: 'Веселье', hint: 'Стэйтем, лотерея и мемы', icon: Laugh },
  { key: 'lottery', label: 'Лотерея', hint: 'испытай удачу', icon: Ticket },
]

export const DEFAULT_MISC_SECTION: MiscSectionKey = 'subscriptions'

export const isMiscSection = (value: string): value is MiscSectionKey =>
  value === 'clowns' || miscSections.some((section) => section.key === value)

import { ChartNoAxesColumn, CheckSquare, Moon, Target } from 'lucide-react'
import type { ProductivityKind } from '../../../data'
import type { SectionTab } from '../../../components/SectionTabs/SectionTabs'
import { getTranslation, type Lang } from '../../../lib/i18n'

export type ProductivityTabKey = ProductivityKind | 'status'

export type ProductivityTab = {
  key: ProductivityTabKey
  label: string
  hint: string
  icon: typeof CheckSquare
}

export const productivityTabs: ProductivityTab[] = [
  { key: 'task', label: 'Задачи', hint: '+10 баллов', icon: CheckSquare },
  { key: 'goal', label: 'Цели', hint: '+100 баллов', icon: Target },
  { key: 'dream', label: 'Мечты', hint: '+1000 баллов', icon: Moon },
  { key: 'status', label: 'Статус', hint: 'баллы и месяцы', icon: ChartNoAxesColumn },
]

export const toProductivityTab = (tab: ProductivityTab, lang: Lang): SectionTab => ({
  to: `/extra/productivity/${tab.key}`,
  label: getTranslation(`productivity.tab.${tab.key}`, lang, tab.label),
  hint: getTranslation(`productivity.tab.${tab.key}Hint`, lang, tab.hint),
  icon: tab.icon,
  end: true,
})

export const DEFAULT_PRODUCTIVITY_TAB: ProductivityTabKey = 'task'

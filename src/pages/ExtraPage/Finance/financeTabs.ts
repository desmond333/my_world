import { CreditCard, Landmark, Lightbulb, Repeat, Wallet } from 'lucide-react'
import { toSectionTab, type SectionTab } from '../../../widgets'
import type { Lang } from '../../../lib/i18n'

export type FinanceTabKey = 'operations' | 'deposits' | 'loans' | 'subscriptions' | 'advice'

export type FinanceTab = {
  key: FinanceTabKey
  label: string
  hint: string
  icon: typeof Wallet
}

export const financeTabs: FinanceTab[] = [
  { key: 'operations', label: 'Операции', hint: 'баланс и доходы', icon: Wallet },
  { key: 'deposits', label: 'Вклады', hint: 'пассивный доход', icon: Landmark },
  { key: 'loans', label: 'Кредиты', hint: 'долги и графики', icon: CreditCard },
  { key: 'subscriptions', label: 'Подписки', hint: 'регулярные платежи', icon: Repeat },
  { key: 'advice', label: 'Советы', hint: 'как обращаться с деньгами', icon: Lightbulb },
]

export const toFinanceTab = (tab: FinanceTab, lang: Lang): SectionTab => toSectionTab('/extra/finance', 'finance', lang, tab, true)

export const DEFAULT_FINANCE_TAB: FinanceTabKey = 'operations'

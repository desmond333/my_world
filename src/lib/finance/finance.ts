import type { Currency, CurrencyRates, FinanceEntry, FinanceKind } from '../../data'
import { monthKeyParts, sortByNewestKey } from '../date'
import { getTranslation, localeOf, type Lang } from '../i18n'

export const CURRENCIES: Currency[] = ['RUB', 'USD', 'GEL']

export const CURRENCY_MARKS: Record<Currency, string> = { RUB: '₽', USD: '$', GEL: '₾' }

export const CURRENCY_NAMES: Record<Currency, string> = { RUB: 'рубли', USD: 'доллары', GEL: 'лари' }

export const DEFAULT_CURRENCY: Currency = 'RUB'

export const DEFAULT_RATES: CurrencyRates = { RUB: 1, USD: 90, GEL: 33 }

export const FINANCE_KINDS: FinanceKind[] = ['salary', 'oneoff']

export const FINANCE_LABELS: Record<FinanceKind, string> = { salary: 'Зарплата', oneoff: 'Разовое' }

export const currencyName = (currency: Currency, lang: Lang = 'ru') =>
  getTranslation(`finance.currency.${currency}`, lang, CURRENCY_NAMES[currency])

export const financeKindLabel = (kind: FinanceKind, lang: Lang = 'ru') => getTranslation(`finance.kind.${kind}`, lang, FINANCE_LABELS[kind])

export const isCurrency = (value: string): value is Currency => CURRENCIES.includes(value as Currency)

export const convert = (amount: number, from: Currency, to: Currency, rates: CurrencyRates) => {
  const fromRate = rates[from] || 1
  const toRate = rates[to] || 1
  return (amount * fromRate) / toRate
}

const money = (value: number, lang: Lang = 'ru') =>
  new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: value < 100 ? 2 : 0 }).format(value)

export const formatMoney = (amount: number, currency: Currency, lang: Lang = 'ru') => `${money(amount, lang)} ${CURRENCY_MARKS[currency]}`

export const formatCompactNumber = (value: number, lang: Lang = 'ru') =>
  new Intl.NumberFormat(localeOf(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatCompactMoney = (amount: number, currency: Currency, lang: Lang = 'ru') =>
  `${formatCompactNumber(amount, lang)} ${CURRENCY_MARKS[currency]}`

export const formatConverted = (amount: number, from: Currency, to: Currency, rates: CurrencyRates, lang: Lang = 'ru') =>
  formatMoney(convert(amount, from, to, rates), to, lang)

export type RateRow = { from: Currency; to: Currency; value: string }

export const rateRows = (rates: CurrencyRates, lang: Lang = 'ru'): RateRow[] =>
  CURRENCIES.flatMap((from) =>
    CURRENCIES.filter((to) => from !== to).map((to) => ({
      from,
      to,
      value: `${new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 3 }).format(convert(1, from, to, rates))} ${CURRENCY_MARKS[to]}`,
    })),
  )

export type MonthTotal = { month: string; salary: number; oneoff: number; total: number; count: number }

export const monthTotal = (entries: FinanceEntry[], month: string, currency: Currency, rates: CurrencyRates): MonthTotal => {
  const own = entries.filter((entry) => entry.month === month)
  const salary = own
    .filter((entry) => entry.kind === 'salary')
    .reduce((sum, entry) => sum + convert(entry.amount, entry.currency, currency, rates), 0)
  const oneoff = own
    .filter((entry) => entry.kind === 'oneoff')
    .reduce((sum, entry) => sum + convert(entry.amount, entry.currency, currency, rates), 0)
  return { month, salary, oneoff, total: salary + oneoff, count: own.length }
}

export const monthsWithEntries = (entries: FinanceEntry[], current: string) => {
  const keys = new Set(entries.map((entry) => entry.month))
  keys.add(current)
  return [...keys].sort(sortByNewestKey)
}

export type YearTotal = { year: number; total: number; months: number }

export const groupByYear = (months: string[], total: (month: string) => number): YearTotal[] => {
  const years = new Map<number, { total: number; months: number }>()
  months.forEach((month) => {
    const { year } = monthKeyParts(month)
    const current = years.get(year) ?? { total: 0, months: 0 }
    years.set(year, { total: current.total + total(month), months: current.months + 1 })
  })
  return [...years.entries()]
    .sort((first, second) => second[0] - first[0])
    .map(([year, value]) => ({ year, total: value.total, months: value.months }))
}

import type { Currency, CurrencyRates, Deposit, FinanceEntry, Loan } from '../../data'
import { CURRENCIES, convert } from './finance'
import { calculateDepositsSummary } from './deposits'
import { calculateLoansSummary } from './loans'

export type FinanceOverviewInput = {
  entries: FinanceEntry[]
  balance: CurrencyRates
  deposits: Deposit[]
  loans: Loan[]
  subscriptionMonthly: number
  currency: Currency
  rates: CurrencyRates
  today: string
}

export type FinanceForecastMonth = {
  month: number
  balance: number
}

export type FinanceOverview = {
  savings: number
  monthlyIncome: number
  monthlySalary: number
  monthlyDepositIncome: number
  monthlyLoanLoad: number
  monthlySubscriptions: number
  monthlyExpenses: number
  monthlyNet: number
  runwayMonths: number | null
  totalDeposits: number
  totalDebt: number
  forecast: FinanceForecastMonth[]
}

const FORECAST_MONTHS = 6

const averageMonthlySalary = (entries: FinanceEntry[], currency: Currency, rates: CurrencyRates): number => {
  const byMonth = new Map<string, number>()

  for (const entry of entries) {
    if (entry.kind !== 'salary') continue
    byMonth.set(entry.month, (byMonth.get(entry.month) ?? 0) + convert(entry.amount, entry.currency, currency, rates))
  }

  if (byMonth.size === 0) return 0

  const totals = [...byMonth.values()]
  return totals.reduce((sum, value) => sum + value, 0) / totals.length
}

export const calculateFinanceOverview = (input: FinanceOverviewInput): FinanceOverview => {
  const { entries, balance, deposits, loans, subscriptionMonthly, currency, rates, today } = input

  const savings = CURRENCIES.reduce((sum, item) => sum + convert(balance[item] ?? 0, item, currency, rates), 0)

  const depositSummary = calculateDepositsSummary(deposits, today, currency, rates)
  const loanSummary = calculateLoansSummary(loans, today, currency, rates)

  const monthlySalary = averageMonthlySalary(entries, currency, rates)
  const monthlyDepositIncome = depositSummary.monthlyPassive
  const monthlyIncome = monthlySalary + monthlyDepositIncome

  const monthlyLoanLoad = loanSummary.totalMonthlyLoad
  const monthlySubscriptions = subscriptionMonthly
  const monthlyExpenses = monthlyLoanLoad + monthlySubscriptions
  const monthlyNet = monthlyIncome - monthlyExpenses

  const runwayMonths = monthlyNet < 0 ? Math.max(0, savings / -monthlyNet) : null

  const forecast: FinanceForecastMonth[] = []
  let projected = savings
  for (let month = 1; month <= FORECAST_MONTHS; month++) {
    projected += monthlyNet
    forecast.push({ month, balance: projected })
  }

  return {
    savings,
    monthlyIncome,
    monthlySalary,
    monthlyDepositIncome,
    monthlyLoanLoad,
    monthlySubscriptions,
    monthlyExpenses,
    monthlyNet,
    runwayMonths,
    totalDeposits: depositSummary.totalPrincipal,
    totalDebt: loanSummary.totalRemainingDebt,
    forecast,
  }
}

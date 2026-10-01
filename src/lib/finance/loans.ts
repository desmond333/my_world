import type { Currency, CurrencyRates, Loan } from '../../data'
import { convert } from './finance'

export const POPULAR_LOAN_BANKS = ['Сбербанк', 'Т-Банк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'Совкомбанк', 'Дом.РФ']

export const LOAN_PRESETS = [
  { title: 'Ипотека', bank: 'Сбербанк', rate: 10.5, paymentDay: 15 },
  { title: 'Автокредит', bank: 'Т-Банк', rate: 16.9, paymentDay: 20 },
  { title: 'Потребительский', bank: 'ВТБ', rate: 19.5, paymentDay: 10 },
  { title: 'Рассрочка', bank: 'Альфа-Банк', rate: 0, paymentDay: 5 },
]

export type LoanMetrics = {
  repaidAmount: number
  repaidPercent: number
  daysUntilPayment: number
  nextPaymentDate: string
  annualPayment: number
  isFullyPaid: boolean
}

export const calculateLoanMetrics = (loan: Loan, today: string): LoanMetrics => {
  const initial = Number(loan.initialAmount) || 0
  const remaining = Math.max(0, Number(loan.remainingAmount) || 0)
  const monthly = Number(loan.monthlyPayment) || 0
  const paymentDay = Math.min(31, Math.max(1, Number(loan.paymentDay) || 1))

  const repaidAmount = Math.max(0, initial - remaining)
  const repaidPercent = initial > 0 ? Math.min(100, Math.round((repaidAmount / initial) * 100)) : 0
  const annualPayment = monthly * 12
  const isFullyPaid = remaining <= 0

  const now = new Date(`${today}T12:00:00Z`)
  const curYear = now.getUTCFullYear()
  const curMonth = now.getUTCMonth()
  const curDay = now.getUTCDate()

  let payYear = curYear
  let payMonth = curMonth

  if (curDay > paymentDay) {
    payMonth += 1
    if (payMonth > 11) {
      payMonth = 0
      payYear += 1
    }
  }

  const daysInMonth = new Date(Date.UTC(payYear, payMonth + 1, 0)).getUTCDate()
  const targetDay = Math.min(paymentDay, daysInMonth)
  const nextPayment = new Date(Date.UTC(payYear, payMonth, targetDay, 12, 0, 0))
  const daysUntilPayment = Math.max(0, Math.ceil((nextPayment.getTime() - now.getTime()) / 86400000))
  const nextPaymentDate = nextPayment.toISOString().slice(0, 10)

  return {
    repaidAmount,
    repaidPercent,
    daysUntilPayment,
    nextPaymentDate,
    annualPayment,
    isFullyPaid,
  }
}

export type LoansSummary = {
  totalRemainingDebt: number
  totalInitialDebt: number
  totalRepaid: number
  totalMonthlyLoad: number
  totalAnnualLoad: number
  closestPaymentDays: number | null
  closestLoanTitle: string | null
  activeCount: number
  totalCount: number
}

export const calculateLoansSummary = (loans: Loan[], today: string, targetCurrency: Currency, rates: CurrencyRates): LoansSummary => {
  let totalRemainingDebt = 0
  let totalInitialDebt = 0
  let totalRepaid = 0
  let totalMonthlyLoad = 0
  let totalAnnualLoad = 0
  let closestPaymentDays: number | null = null
  let closestLoanTitle: string | null = null
  let activeCount = 0

  for (const loan of loans) {
    const calc = calculateLoanMetrics(loan, today)
    const convertedRemaining = convert(loan.remainingAmount, loan.currency, targetCurrency, rates)
    const convertedInitial = convert(loan.initialAmount, loan.currency, targetCurrency, rates)
    const convertedRepaid = convert(calc.repaidAmount, loan.currency, targetCurrency, rates)
    const convertedMonthly = convert(loan.monthlyPayment, loan.currency, targetCurrency, rates)
    const convertedAnnual = convert(calc.annualPayment, loan.currency, targetCurrency, rates)

    totalRemainingDebt += convertedRemaining
    totalInitialDebt += convertedInitial
    totalRepaid += convertedRepaid

    if (!calc.isFullyPaid) {
      activeCount += 1
      totalMonthlyLoad += convertedMonthly
      totalAnnualLoad += convertedAnnual

      if (closestPaymentDays === null || calc.daysUntilPayment < closestPaymentDays) {
        closestPaymentDays = calc.daysUntilPayment
        closestLoanTitle = loan.title
      }
    }
  }

  return {
    totalRemainingDebt: Math.round(totalRemainingDebt),
    totalInitialDebt: Math.round(totalInitialDebt),
    totalRepaid: Math.round(totalRepaid),
    totalMonthlyLoad: Math.round(totalMonthlyLoad),
    totalAnnualLoad: Math.round(totalAnnualLoad),
    closestPaymentDays,
    closestLoanTitle,
    activeCount,
    totalCount: loans.length,
  }
}

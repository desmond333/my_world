import type { Currency, CurrencyRates, Deposit } from '../../data'
import { convert } from './finance'

export const POPULAR_DEPOSIT_BANKS = ['Сбербанк', 'Т-Банк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'Совкомбанк', 'Россельхозбанк']

export const DEPOSIT_PRESETS = [
  { title: 'Накопительный счёт', bank: 'Т-Банк', rate: 16, periodMonths: 12, isCapitalized: true },
  { title: 'Вклад «Лучший %»', bank: 'Сбербанк', rate: 18.5, periodMonths: 6, isCapitalized: false },
  { title: 'Вклад «Доходный»', bank: 'ВТБ', rate: 19, periodMonths: 3, isCapitalized: false },
  { title: 'Альфа-Вклад Максимальный', bank: 'Альфа-Банк', rate: 18, periodMonths: 12, isCapitalized: true },
]

export type DepositYield = {
  daily: number
  weekly: number
  monthly: number
  annual: number
  totalYield: number
  finalAmount: number
  endDate: string
  daysElapsed: number
  daysTotal: number
  progressPercent: number
  isExpired: boolean
}

export const calculateDepositYield = (deposit: Deposit, today: string): DepositYield => {
  const { amount, rate, startDate, periodMonths, isCapitalized } = deposit
  const r = (Number(rate) || 0) / 100
  const p = Number(amount) || 0
  const months = Math.max(1, Number(periodMonths) || 1)

  const start = new Date(`${startDate || today}T12:00:00Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + months)
  const endDate = end.toISOString().slice(0, 10)

  const todayDate = new Date(`${today}T12:00:00Z`)
  const totalMs = Math.max(86400000, end.getTime() - start.getTime())
  const elapsedMs = Math.max(0, Math.min(totalMs, todayDate.getTime() - start.getTime()))
  const daysTotal = Math.max(1, Math.round(totalMs / 86400000))
  const daysElapsed = Math.min(daysTotal, Math.round(elapsedMs / 86400000))
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / daysTotal) * 100)))
  const isExpired = todayDate.getTime() >= end.getTime()

  let totalYield: number
  let monthly: number
  let annual: number
  let daily: number
  let weekly: number

  if (isCapitalized) {
    const totalAmount = p * Math.pow(1 + r / 12, months)
    totalYield = totalAmount - p
    monthly = months > 0 ? totalYield / months : 0
    annual = p * (Math.pow(1 + r / 12, 12) - 1)
    daily = totalYield / daysTotal
    weekly = daily * 7
  } else {
    totalYield = p * r * (months / 12)
    monthly = (p * r) / 12
    annual = p * r
    daily = (p * r) / 365
    weekly = daily * 7
  }

  return {
    daily: Math.round(daily * 100) / 100,
    weekly: Math.round(weekly * 100) / 100,
    monthly: Math.round(monthly * 100) / 100,
    annual: Math.round(annual * 100) / 100,
    totalYield: Math.round(totalYield),
    finalAmount: Math.round(p + totalYield),
    endDate,
    daysElapsed,
    daysTotal,
    progressPercent,
    isExpired,
  }
}

export type DepositsSummary = {
  totalPrincipal: number
  dailyPassive: number
  weeklyPassive: number
  monthlyPassive: number
  annualPassive: number
  totalMaturityYield: number
  averageRate: number
  activeCount: number
  totalCount: number
}

export const calculateDepositsSummary = (
  deposits: Deposit[],
  today: string,
  targetCurrency: Currency,
  rates: CurrencyRates,
): DepositsSummary => {
  let totalPrincipal = 0
  let dailyPassive = 0
  let weeklyPassive = 0
  let monthlyPassive = 0
  let annualPassive = 0
  let totalMaturityYield = 0
  let weightedRateSum = 0
  let activeCount = 0

  for (const deposit of deposits) {
    const calc = calculateDepositYield(deposit, today)
    const convertedPrincipal = convert(deposit.amount, deposit.currency, targetCurrency, rates)
    const convertedDaily = convert(calc.daily, deposit.currency, targetCurrency, rates)
    const convertedWeekly = convert(calc.weekly, deposit.currency, targetCurrency, rates)
    const convertedMonthly = convert(calc.monthly, deposit.currency, targetCurrency, rates)
    const convertedAnnual = convert(calc.annual, deposit.currency, targetCurrency, rates)
    const convertedTotal = convert(calc.totalYield, deposit.currency, targetCurrency, rates)

    totalPrincipal += convertedPrincipal
    totalMaturityYield += convertedTotal

    if (!calc.isExpired) {
      activeCount += 1
      dailyPassive += convertedDaily
      weeklyPassive += convertedWeekly
      monthlyPassive += convertedMonthly
      annualPassive += convertedAnnual
      weightedRateSum += deposit.rate * convertedPrincipal
    }
  }

  const averageRate = totalPrincipal > 0 ? Math.round((weightedRateSum / totalPrincipal) * 10) / 10 : 0

  return {
    totalPrincipal: Math.round(totalPrincipal),
    dailyPassive: Math.round(dailyPassive * 100) / 100,
    weeklyPassive: Math.round(weeklyPassive * 100) / 100,
    monthlyPassive: Math.round(monthlyPassive * 100) / 100,
    annualPassive: Math.round(annualPassive * 100) / 100,
    totalMaturityYield: Math.round(totalMaturityYield),
    averageRate,
    activeCount,
    totalCount: deposits.length,
  }
}

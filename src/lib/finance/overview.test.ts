import { describe, expect, it } from 'vitest'
import { DEFAULT_RATES } from './finance'
import { calculateFinanceOverview } from './overview'
import type { CurrencyRates, FinanceEntry, Loan } from '../../data'

const rates: CurrencyRates = { ...DEFAULT_RATES }

const salary = (month: string, amount: number, currency: FinanceEntry['currency'] = 'RUB'): FinanceEntry => ({
  id: `s-${month}`,
  month,
  kind: 'salary',
  amount,
  currency,
  note: '',
  createdAt: '2026-01-01T00:00:00.000Z',
})

const loan = (overrides: Partial<Loan> = {}): Loan => ({
  id: 'loan-1',
  title: 'Car',
  bank: 'Bank',
  initialAmount: 10000,
  remainingAmount: 9000,
  currency: 'RUB',
  rate: 12,
  monthlyPayment: 500,
  paymentDay: 10,
  startDate: '2025-01-01',
  endDate: '2028-01-01',
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('calculateFinanceOverview', () => {
  it('averages recurring salary and reports positive net', () => {
    const overview = calculateFinanceOverview({
      entries: [salary('2026-01', 100), salary('2026-02', 100)],
      balance: { RUB: 1000, USD: 0, GEL: 0 },
      deposits: [],
      loans: [],
      subscriptionMonthly: 30,
      currency: 'RUB',
      rates,
      today: '2026-03-01',
    })

    expect(overview.savings).toBe(1000)
    expect(overview.monthlySalary).toBe(100)
    expect(overview.monthlyExpenses).toBe(30)
    expect(overview.monthlyNet).toBe(70)
    expect(overview.runwayMonths).toBeNull()
  })

  it('calculates how long savings last when expenses exceed income', () => {
    const overview = calculateFinanceOverview({
      entries: [salary('2026-02', 100)],
      balance: { RUB: 1000, USD: 0, GEL: 0 },
      deposits: [],
      loans: [loan({ monthlyPayment: 200 })],
      subscriptionMonthly: 30,
      currency: 'RUB',
      rates,
      today: '2026-03-01',
    })

    expect(overview.monthlyIncome).toBe(100)
    expect(overview.monthlyExpenses).toBe(230)
    expect(overview.monthlyNet).toBe(-130)
    expect(overview.runwayMonths).toBeCloseTo(1000 / 130, 5)
    expect(overview.totalDebt).toBe(9000)
  })

  it('converts savings and salary from mixed currencies', () => {
    const overview = calculateFinanceOverview({
      entries: [salary('2026-02', 1, 'USD')],
      balance: { RUB: 0, USD: 1, GEL: 0 },
      deposits: [],
      loans: [],
      subscriptionMonthly: 0,
      currency: 'RUB',
      rates,
      today: '2026-03-01',
    })

    expect(overview.savings).toBe(rates.USD)
    expect(overview.monthlySalary).toBe(rates.USD)
  })

  it('builds a six month forecast of the projected balance', () => {
    const overview = calculateFinanceOverview({
      entries: [],
      balance: { RUB: 600, USD: 0, GEL: 0 },
      deposits: [],
      loans: [],
      subscriptionMonthly: 100,
      currency: 'RUB',
      rates,
      today: '2026-03-01',
    })

    expect(overview.monthlyNet).toBe(-100)
    expect(overview.forecast).toHaveLength(6)
    expect(overview.forecast[0].balance).toBe(500)
    expect(overview.forecast[5].balance).toBe(0)
  })
})

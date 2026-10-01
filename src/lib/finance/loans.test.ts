import { describe, expect, it } from 'vitest'
import type { Loan } from '../../data'
import { calculateLoanMetrics, calculateLoansSummary } from './loans'
import { DEFAULT_RATES } from './finance'

describe('calculateLoanMetrics', () => {
  it('calculates repayment progress and payment days correctly', () => {
    const loan: Loan = {
      id: 'loan-1',
      title: 'Ипотека',
      bank: 'Сбербанк',
      initialAmount: 3000000,
      remainingAmount: 2100000,
      currency: 'RUB',
      rate: 9.5,
      monthlyPayment: 26000,
      paymentDay: 15,
      startDate: '2023-01-01',
      endDate: '2038-01-01',
      createdAt: '2023-01-01T00:00:00Z',
    }

    const res = calculateLoanMetrics(loan, '2026-05-10')
    expect(res.repaidAmount).toBe(900000)
    expect(res.repaidPercent).toBe(30)
    expect(res.daysUntilPayment).toBe(5)
    expect(res.nextPaymentDate).toBe('2026-05-15')
    expect(res.annualPayment).toBe(26000 * 12)
    expect(res.isFullyPaid).toBe(false)
  })

  it('detects fully paid loan', () => {
    const loan: Loan = {
      id: 'loan-2',
      title: 'Рассрочка',
      bank: 'Альфа-Банк',
      initialAmount: 50000,
      remainingAmount: 0,
      currency: 'RUB',
      rate: 0,
      monthlyPayment: 5000,
      paymentDay: 20,
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      createdAt: '2025-01-01T00:00:00Z',
    }

    const res = calculateLoanMetrics(loan, '2026-01-01')
    expect(res.repaidAmount).toBe(50000)
    expect(res.repaidPercent).toBe(100)
    expect(res.isFullyPaid).toBe(true)
  })
})

describe('calculateLoansSummary', () => {
  it('aggregates multi-loan portfolio metrics', () => {
    const loans: Loan[] = [
      {
        id: 'loan-1',
        title: 'Кредит 1',
        bank: 'ВТБ',
        initialAmount: 100000,
        remainingAmount: 60000,
        currency: 'RUB',
        rate: 15,
        monthlyPayment: 10000,
        paymentDay: 12,
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'loan-2',
        title: 'Кредит 2',
        bank: 'Т-Банк',
        initialAmount: 1000,
        remainingAmount: 500,
        currency: 'USD',
        rate: 10,
        monthlyPayment: 100,
        paymentDay: 25,
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ]

    const summary = calculateLoansSummary(loans, '2026-05-10', 'RUB', DEFAULT_RATES)
    expect(summary.totalRemainingDebt).toBe(60000 + 500 * 90)
    expect(summary.totalInitialDebt).toBe(100000 + 1000 * 90)
    expect(summary.totalRepaid).toBe(40000 + 500 * 90)
    expect(summary.totalMonthlyLoad).toBe(10000 + 100 * 90)
    expect(summary.activeCount).toBe(2)
    expect(summary.closestPaymentDays).toBe(2)
    expect(summary.closestLoanTitle).toBe('Кредит 1')
  })
})

import { describe, expect, it } from 'vitest'
import type { Deposit } from '../../data'
import { calculateDepositYield, calculateDepositsSummary } from './deposits'
import { DEFAULT_RATES } from './finance'

describe('calculateDepositYield', () => {
  it('calculates simple interest deposit correctly', () => {
    const deposit: Deposit = {
      id: 'dep-1',
      title: 'Вклад',
      bank: 'Сбербанк',
      amount: 120000,
      currency: 'RUB',
      rate: 10,
      startDate: '2026-01-01',
      periodMonths: 12,
      isCapitalized: false,
      createdAt: '2026-01-01T00:00:00Z',
    }

    const res = calculateDepositYield(deposit, '2026-07-01')
    expect(res.annual).toBe(12000)
    expect(res.monthly).toBe(1000)
    expect(res.totalYield).toBe(12000)
    expect(res.finalAmount).toBe(132000)
    expect(res.daily).toBeCloseTo(12000 / 365, 1)
    expect(res.weekly).toBeCloseTo((12000 / 365) * 7, 1)
    expect(res.isExpired).toBe(false)
    expect(res.progressPercent).toBeGreaterThan(45)
  })

  it('calculates compound interest (capitalized) deposit correctly', () => {
    const deposit: Deposit = {
      id: 'dep-2',
      title: 'Капитализация',
      bank: 'Т-Банк',
      amount: 100000,
      currency: 'RUB',
      rate: 12,
      startDate: '2026-01-01',
      periodMonths: 12,
      isCapitalized: true,
      createdAt: '2026-01-01T00:00:00Z',
    }

    const res = calculateDepositYield(deposit, '2026-01-01')
    expect(res.totalYield).toBeGreaterThan(12000)
    expect(res.finalAmount).toBeGreaterThan(112000)
    expect(res.monthly).toBeGreaterThan(1000)
  })

  it('detects expired deposits', () => {
    const deposit: Deposit = {
      id: 'dep-3',
      title: 'Старый вклад',
      bank: 'ВТБ',
      amount: 50000,
      currency: 'RUB',
      rate: 8,
      startDate: '2024-01-01',
      periodMonths: 6,
      isCapitalized: false,
      createdAt: '2024-01-01T00:00:00Z',
    }

    const res = calculateDepositYield(deposit, '2026-01-01')
    expect(res.isExpired).toBe(true)
    expect(res.progressPercent).toBe(100)
  })
})

describe('calculateDepositsSummary', () => {
  it('aggregates portfolio metrics across multiple deposits and currencies', () => {
    const deposits: Deposit[] = [
      {
        id: 'dep-1',
        title: 'Вклад 1',
        bank: 'Сбербанк',
        amount: 100000,
        currency: 'RUB',
        rate: 16,
        startDate: '2026-01-01',
        periodMonths: 12,
        isCapitalized: false,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'dep-2',
        title: 'Вклад 2',
        bank: 'Т-Банк',
        amount: 1000,
        currency: 'USD',
        rate: 5,
        startDate: '2026-01-01',
        periodMonths: 12,
        isCapitalized: false,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]

    const summary = calculateDepositsSummary(deposits, '2026-06-01', 'RUB', DEFAULT_RATES)
    expect(summary.totalPrincipal).toBe(190000)
    expect(summary.activeCount).toBe(2)
    expect(summary.totalCount).toBe(2)
    expect(summary.monthlyPassive).toBeGreaterThan(1000)
    expect(summary.dailyPassive).toBeGreaterThan(30)
    expect(summary.averageRate).toBeGreaterThan(10)
  })
})

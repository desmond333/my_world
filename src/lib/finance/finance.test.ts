import { describe, it, expect } from 'vitest'
import { convert, formatMoney, isCurrency, monthTotal, groupByYear, DEFAULT_RATES } from './finance'
import type { FinanceEntry } from '../../data'

describe('convert', () => {
  it('returns same amount for same currency', () => {
    expect(convert(100, 'RUB', 'RUB', DEFAULT_RATES)).toBe(100)
  })

  it('converts RUB to USD correctly', () => {
    expect(convert(90, 'RUB', 'USD', DEFAULT_RATES)).toBeCloseTo(1)
  })

  it('converts USD to RUB correctly', () => {
    expect(convert(1, 'USD', 'RUB', DEFAULT_RATES)).toBeCloseTo(90)
  })

  it('converts GEL to USD correctly', () => {
    expect(convert(33, 'GEL', 'USD', DEFAULT_RATES)).toBeCloseTo((33 * 33) / 90)
  })

  it('handles zero amount', () => {
    expect(convert(0, 'USD', 'RUB', DEFAULT_RATES)).toBe(0)
  })
})

describe('isCurrency', () => {
  it('validates known currencies', () => {
    expect(isCurrency('RUB')).toBe(true)
    expect(isCurrency('USD')).toBe(true)
    expect(isCurrency('GEL')).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(isCurrency('EUR')).toBe(false)
    expect(isCurrency('')).toBe(false)
  })
})

describe('formatMoney', () => {
  it('formats RUB with ruble sign', () => {
    expect(formatMoney(100, 'RUB')).toContain('₽')
  })

  it('formats USD with dollar sign', () => {
    expect(formatMoney(100, 'USD')).toContain('$')
  })
})

describe('monthTotal', () => {
  const entries: FinanceEntry[] = [
    { id: '1', month: '2025-01', amount: 90000, currency: 'RUB', kind: 'salary', note: '', createdAt: '' },
    { id: '2', month: '2025-01', amount: 10000, currency: 'RUB', kind: 'oneoff', note: '', createdAt: '' },
    { id: '3', month: '2025-02', amount: 1000, currency: 'USD', kind: 'salary', note: '', createdAt: '' },
  ]

  it('sums salary and oneoff for correct month', () => {
    const result = monthTotal(entries, '2025-01', 'RUB', DEFAULT_RATES)
    expect(result.salary).toBeCloseTo(90000)
    expect(result.oneoff).toBeCloseTo(10000)
    expect(result.total).toBeCloseTo(100000)
    expect(result.count).toBe(2)
  })

  it('converts foreign currency when summing', () => {
    const result = monthTotal(entries, '2025-02', 'RUB', DEFAULT_RATES)
    expect(result.salary).toBeCloseTo(1000 * 90)
  })

  it('returns zeroes for month with no entries', () => {
    const result = monthTotal(entries, '2099-12', 'RUB', DEFAULT_RATES)
    expect(result.total).toBe(0)
    expect(result.count).toBe(0)
  })
})

describe('groupByYear', () => {
  it('groups months by year and sums totals', () => {
    const months = ['2025-01', '2025-02', '2024-12']
    const total = (m: string) => (m.startsWith('2025') ? 100 : 50)
    const years = groupByYear(months, total)
    const y2025 = years.find((y) => y.year === 2025)
    const y2024 = years.find((y) => y.year === 2024)
    expect(y2025?.total).toBe(200)
    expect(y2025?.months).toBe(2)
    expect(y2024?.total).toBe(50)
  })

  it('sorts years newest first', () => {
    const months = ['2023-01', '2025-01', '2024-01']
    const years = groupByYear(months, () => 0)
    expect(years[0].year).toBe(2025)
    expect(years[2].year).toBe(2023)
  })
})

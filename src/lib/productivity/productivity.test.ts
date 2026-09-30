import { describe, it, expect } from 'vitest'
import { countPoints, computeNextRepeatDate, dayTagKind, orderItems, sumMonths, emptyMonth, POINTS } from './productivity'
import type { ProductivityItem, MonthPoints } from '../../data'

describe('countPoints', () => {
  it('returns correct points for task', () => {
    expect(countPoints('task', 3)).toBe(POINTS.task * 3)
  })

  it('returns correct points for goal', () => {
    expect(countPoints('goal', 2)).toBe(POINTS.goal * 2)
  })

  it('returns zero for zero done', () => {
    expect(countPoints('dream', 0)).toBe(0)
  })
})

describe('computeNextRepeatDate', () => {
  it('daily — shifts by 1 day', () => {
    expect(computeNextRepeatDate('2025-01-10', 'daily', '2025-01-10')).toBe('2025-01-11')
  })

  it('weekly — shifts by 7 days', () => {
    expect(computeNextRepeatDate('2025-01-10', 'weekly', '2025-01-10')).toBe('2025-01-17')
  })

  it('monthly — moves to next month same day', () => {
    expect(computeNextRepeatDate('2025-01-15', 'monthly', '2025-01-15')).toBe('2025-02-15')
  })

  it('monthly — clamps to last day of short month', () => {
    expect(computeNextRepeatDate('2025-01-31', 'monthly', '2025-01-31')).toBe('2025-02-28')
  })

  it('none — returns base date unchanged', () => {
    expect(computeNextRepeatDate('2025-01-10', 'none', '2025-01-10')).toBe('2025-01-10')
  })

  it('weekdays — skips Saturday to Monday', () => {
    const result = computeNextRepeatDate('2025-01-11', 'weekdays', '2025-01-11')
    const day = new Date(`${result}T12:00:00Z`).getUTCDay()
    expect(day).not.toBe(6)
    expect(day).not.toBe(0)
  })
})

describe('dayTagKind', () => {
  it('returns today for same date', () => {
    expect(dayTagKind('2025-01-15', '2025-01-15')).toBe('today')
  })

  it('returns tomorrow for next day', () => {
    expect(dayTagKind('2025-01-16', '2025-01-15')).toBe('tomorrow')
  })

  it('returns yesterday for prev day', () => {
    expect(dayTagKind('2025-01-14', '2025-01-15')).toBe('yesterday')
  })

  it('returns overdue for past dates', () => {
    expect(dayTagKind('2025-01-01', '2025-01-15')).toBe('overdue')
  })

  it('returns future for future dates', () => {
    expect(dayTagKind('2025-02-01', '2025-01-15')).toBe('future')
  })

  it('returns undated for empty key', () => {
    expect(dayTagKind('', '2025-01-15')).toBe('undated')
  })
})

describe('orderItems', () => {
  const makeItem = (id: string, priority: string, done = false): ProductivityItem => ({
    id,
    kind: 'task',
    title: id,
    done,
    date: '',
    doneAt: null,
    priority: priority as ProductivityItem['priority'],
    createdAt: '',
  })

  it('puts high priority before low', () => {
    const items = [makeItem('low', 'low'), makeItem('high', 'high'), makeItem('med', 'medium')]
    const ordered = orderItems(items)
    expect(ordered[0].id).toBe('high')
    expect(ordered[2].id).toBe('low')
  })

  it('puts done items at the end', () => {
    const items = [makeItem('done', 'high', true), makeItem('open', 'low', false)]
    const ordered = orderItems(items)
    expect(ordered[ordered.length - 1].id).toBe('done')
  })
})

describe('sumMonths', () => {
  it('sums all non-empty months', () => {
    const months: Record<string, MonthPoints> = {
      '2025-01': { points: 100, counts: { task: 2, goal: 1, dream: 0 } },
      '2025-02': { points: 50, counts: { task: 1, goal: 0, dream: 0 } },
    }
    const total = sumMonths(months)
    expect(total.points).toBe(150)
    expect(total.counts.task).toBe(3)
  })

  it('returns empty for no months', () => {
    expect(sumMonths({})).toEqual(emptyMonth())
  })
})

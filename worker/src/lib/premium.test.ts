import { describe, expect, it } from 'vitest'
import { addMonths, isPremiumActive } from './premium'

const NOW = '2026-06-15T00:00:00.000Z'

describe('isPremiumActive', () => {
  it('returns true for lifetime premium', () => {
    expect(isPremiumActive({ isPremium: 1, premiumUntil: null }, NOW)).toBe(true)
  })

  it('returns true while the timed premium is in the future', () => {
    expect(isPremiumActive({ isPremium: 0, premiumUntil: '2026-07-15T00:00:00.000Z' }, NOW)).toBe(true)
  })

  it('returns false after the timed premium expired', () => {
    expect(isPremiumActive({ isPremium: 0, premiumUntil: '2026-05-15T00:00:00.000Z' }, NOW)).toBe(false)
  })

  it('returns false without any premium data', () => {
    expect(isPremiumActive({}, NOW)).toBe(false)
  })
})

describe('addMonths', () => {
  it('adds whole months', () => {
    expect(addMonths('2026-01-10T00:00:00.000Z', 2)).toBe('2026-03-10T00:00:00.000Z')
  })

  it('clamps to the last day of a shorter month', () => {
    expect(addMonths('2026-01-31T00:00:00.000Z', 1)).toBe('2026-02-28T00:00:00.000Z')
  })
})

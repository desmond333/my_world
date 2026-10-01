import { MINUTES_IN_DAY, type AvailabilityScope, type AvailabilityWindow } from '../../data'

export const DAY_KEYS = [0, 1, 2, 3, 4, 5, 6] as const

export const minutesToTime = (value: number): string => {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export const timeToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return Math.min(Math.max(hours * 60 + minutes, 0), MINUTES_IN_DAY)
}

export const groupAvailability = (windows: AvailabilityWindow[]) => ({
  weekly: windows.filter((window) => window.scope === 'weekly'),
  dated: windows.filter((window) => window.scope === 'date'),
})

export const isAvailabilityRangeValid = (startMin: number, endMin: number): boolean => endMin > startMin

export const isAvailabilityDateValid = (scope: AvailabilityScope, date: string): boolean => scope === 'weekly' || Boolean(date)

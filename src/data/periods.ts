import type { PeriodOption } from './types'

export const anyPeriod: PeriodOption = { id: 'any', label: 'Любые годы', from: null, to: null }

const currentYear = new Date().getFullYear()

export const releasePeriods: PeriodOption[] = [
  { id: 'before-2000', label: 'до 2000', from: null, to: 2000 },
  { id: '2000-2010', label: '2000–2010', from: 2000, to: 2010 },
  { id: '2010-2015', label: '2010–2015', from: 2010, to: 2015 },
  { id: '2015-2020', label: '2015–2020', from: 2015, to: 2020 },
  { id: '2020-2025', label: '2020–2025', from: 2020, to: 2025 },
  { id: '2025-now', label: `2025–${currentYear}`, from: 2025, to: null },
]

export const periodOptions: PeriodOption[] = [anyPeriod, ...releasePeriods]

export const findPeriod = (id: string) => periodOptions.find((period) => period.id === id) ?? anyPeriod

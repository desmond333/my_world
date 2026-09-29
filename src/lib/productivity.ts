import type { KindCounts, MonthPoints, ProductivityItem, ProductivityKind, RepeatInterval } from '../data'
import { formatShortDate, sortByNewestKey } from './date'
import { plural } from './plural'

export const POINTS: Record<ProductivityKind, number> = { task: 10, goal: 100, dream: 1000 }

export const KIND_TITLES: Record<ProductivityKind, string> = { task: 'Задачи', goal: 'Цели', dream: 'Мечты' }

export const KIND_FORMS: Record<ProductivityKind, [string, string, string]> = {
  task: ['задача', 'задачи', 'задач'],
  goal: ['цель', 'цели', 'целей'],
  dream: ['мечта', 'мечты', 'мечт'],
}

export const KIND_PLURAL: Record<ProductivityKind, string> = {
  task: 'задач',
  goal: 'целей',
  dream: 'мечт',
}

export const emptyCounts = (): KindCounts => ({ task: 0, goal: 0, dream: 0 })

export const emptyMonth = (): MonthPoints => ({ points: 0, counts: emptyCounts() })

export const isEmptyMonth = (month: MonthPoints | undefined) =>
  !month || (month.points === 0 && month.counts.task === 0 && month.counts.goal === 0 && month.counts.dream === 0)

export const sortMonths = (months: Record<string, MonthPoints>) =>
  Object.keys(months)
    .sort(sortByNewestKey)
    .filter((key) => !isEmptyMonth(months[key]))

export const sumMonths = (months: Record<string, MonthPoints>) =>
  sortMonths(months).reduce(
    (total, key) => ({
      points: total.points + months[key].points,
      counts: {
        task: total.counts.task + months[key].counts.task,
        goal: total.counts.goal + months[key].counts.goal,
        dream: total.counts.dream + months[key].counts.dream,
      },
    }),
    emptyMonth(),
  )

export const countPoints = (kind: ProductivityKind, done: number) => POINTS[kind] * done

export const itemsOf = (items: ProductivityItem[], kind: ProductivityKind) => items.filter((item) => item.kind === kind)

export const orderItems = (items: ProductivityItem[]) => [...items.filter((item) => !item.done), ...items.filter((item) => item.done)]

export const DAY_FORMS: [string, string, string] = ['день', 'дня', 'дней']

export const shiftDate = (key: string, days: number) => {
  if (!key) return ''
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const dayLabel = (key: string, today: string) => {
  if (!key) return ''
  const gap = Math.round((new Date(`${key}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86400000)
  if (gap === 0) return 'сегодня'
  if (gap === 1) return 'завтра'
  if (gap === -1) return 'вчера'
  const overdue = -gap
  if (overdue > 0 && overdue < 30) return `${overdue} ${plural(overdue, DAY_FORMS)} назад`
  return formatShortDate(key)
}

export const UNTITLED_DAY = 'без даты'

export type DayGroup = {
  key: string
  label: string
  items: ProductivityItem[]
}

export const groupByDay = (items: ProductivityItem[], today: string) => {
  const dated = items.filter((item) => item.date)
  const undated = items.filter((item) => !item.date)
  const keys = [...new Set(dated.map((item) => item.date))].sort()
  const groups: DayGroup[] = keys.map((key) => ({ key, label: dayLabel(key, today), items: dated.filter((item) => item.date === key) }))
  if (undated.length > 0) groups.push({ key: '', label: UNTITLED_DAY, items: undated })
  return groups
}

export const todayCount = (items: ProductivityItem[], today: string) => items.filter((item) => item.date === today).length

export const kindCount = (items: ProductivityItem[], kind: ProductivityKind) => itemsOf(items, kind).filter((item) => item.done).length

export const kindPoints = (items: ProductivityItem[], kind: ProductivityKind) => countPoints(kind, kindCount(items, kind))

export type RepeatOption = {
  id: RepeatInterval
  label: string
  short: string
  hint: string
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  { id: 'none', label: 'Однократно', short: '', hint: 'Один раз' },
  { id: 'daily', label: 'Каждый день', short: 'каждый день', hint: 'Ежедневно' },
  { id: 'weekdays', label: 'По будням', short: 'по будням', hint: 'Пн — Пт' },
  { id: 'weekly', label: 'Раз в неделю', short: 'раз в неделю', hint: 'Каждые 7 дней' },
  { id: 'monthly', label: 'Раз в месяц', short: 'раз в месяц', hint: 'Раз в месяц' },
]

export const getRepeatLabel = (repeat?: RepeatInterval, lang: 'ru' | 'en' = 'ru'): string => {
  if (!repeat || repeat === 'none') return ''
  if (lang === 'en') {
    switch (repeat) {
      case 'daily':
        return 'daily'
      case 'weekdays':
        return 'weekdays'
      case 'weekly':
        return 'weekly'
      case 'monthly':
        return 'monthly'
    }
  }
  const found = REPEAT_OPTIONS.find((option) => option.id === repeat)
  return found?.short ?? ''
}

export const computeNextRepeatDate = (baseDate: string, repeat: RepeatInterval, referenceToday: string): string => {
  if (!repeat || repeat === 'none') return baseDate
  const anchor = baseDate && baseDate >= referenceToday ? baseDate : referenceToday
  if (!anchor) return ''

  if (repeat === 'daily') {
    return shiftDate(anchor, 1)
  }

  if (repeat === 'weekdays') {
    let next = shiftDate(anchor, 1)
    const dayOfWeek = new Date(`${next}T12:00:00Z`).getUTCDay()
    if (dayOfWeek === 6) {
      next = shiftDate(next, 2)
    } else if (dayOfWeek === 0) {
      next = shiftDate(next, 1)
    }
    return next
  }

  if (repeat === 'weekly') {
    return shiftDate(anchor, 7)
  }

  if (repeat === 'monthly') {
    const [yStr, mStr, dStr] = anchor.split('-')
    const y = Number(yStr)
    const m = Number(mStr)
    const d = Number(dStr)
    if (!y || !m || !d) return shiftDate(anchor, 30)

    let nextYear = y
    let nextMonth = m + 1
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate()
    const targetDay = Math.min(d, daysInNextMonth)

    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
  }

  return anchor
}

export type DayTagKind = 'today' | 'tomorrow' | 'yesterday' | 'overdue' | 'future' | 'undated'

export const dayTagKind = (key: string, today: string): DayTagKind => {
  if (!key) return 'undated'
  const gap = Math.round((new Date(`${key}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86400000)
  if (gap === 0) return 'today'
  if (gap === 1) return 'tomorrow'
  if (gap === -1) return 'yesterday'
  if (gap < -1) return 'overdue'
  return 'future'
}

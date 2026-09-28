import type { TrainingSport } from '../data'
import { dateKey, formatShortDate, monthTitle } from './date'

export const STRENGTH_ID = 'strength'

export const SPORT_COLORS = ['#f4b849', '#e57450', '#7fc8a9', '#7aa6e8', '#c58fe0', '#e8b04b', '#5fc9d4', '#e88ab0', '#9fb87a', '#d9c48a']

export const BUILTIN_SPORTS: TrainingSport[] = [
  { id: STRENGTH_ID, label: 'Силовая', color: '#f4b849', enabled: true, custom: false },
  { id: 'skate', label: 'Ролики', color: '#7aa6e8', enabled: false, custom: false },
  { id: 'bike', label: 'Велик', color: '#7fc8a9', enabled: false, custom: false },
]

export const sportColor = (sports: TrainingSport[], id: string) => sports.find((sport) => sport.id === id)?.color ?? '#f4b849'

export const activeSports = (sports: TrainingSport[]) => sports.filter((sport) => sport.enabled)

export const daySports = (days: Record<string, string[]>, date: string) => days[date] ?? []

export const hasTraining = (days: Record<string, string[]>, date: string) => daySports(days, date).length > 0

export const toggleIn = (kinds: string[], id: string) => (kinds.includes(id) ? kinds.filter((item) => item !== id) : [...kinds, id])

export const sportTotals = (days: Record<string, string[]>, sports: TrainingSport[]) =>
  sports.map((sport) => ({
    sport,
    count: Object.values(days).filter((kinds) => kinds.includes(sport.id)).length,
  }))

export const trainingStats = (days: Record<string, string[]>, today: string) => {
  const dates = Object.keys(days)
    .filter((date) => hasTraining(days, date))
    .sort()
  let streak = 0
  const cursor = new Date(`${today}T12:00:00Z`)
  while (hasTraining(days, dateKey(cursor))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  const month = today.slice(0, 7)
  return { total: dates.length, streak, month: dates.filter((date) => date.startsWith(month)).length, last: dates[dates.length - 1] ?? '' }
}

export const trainingReport = (days: Record<string, string[]>, today: string, cityName: string, sports: TrainingSport[]) => {
  const stats = trainingStats(days, today)
  const byMonth = new Map<string, number[]>()
  Object.keys(days)
    .filter((date) => hasTraining(days, date))
    .sort()
    .forEach((date) => {
      const [year, month, day] = date.split('-')
      byMonth.set(`${year}-${month}`, [...(byMonth.get(`${year}-${month}`) ?? []), Number(day)])
    })
  const lines = [
    `Тренировки — ${cityName}`,
    'Календарь отмечен по датам, время считается местным.',
    '',
    `Всего дней с тренировкой: ${stats.total}`,
    `Подряд сейчас: ${stats.streak}`,
    `В этом месяце: ${stats.month}`,
    `Последняя тренировка: ${stats.last ? formatShortDate(stats.last) : 'пока нет'}`,
  ]
  const totals = sportTotals(days, sports).filter((item) => item.count > 0)
  if (totals.length) {
    lines.push('', 'По видам:')
    totals.forEach(({ sport, count }) => lines.push(`${sport.label} — ${count}`))
  }
  if (byMonth.size) {
    lines.push('', 'По месяцам:')
    byMonth.forEach((numbers, key) => {
      const [year, month] = key.split('-').map(Number)
      lines.push(`${monthTitle(year, month - 1)} — ${numbers.join(', ')}`)
    })
  }
  return lines.join('\n')
}

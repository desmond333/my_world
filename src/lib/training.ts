import { dateKey, formatShortDate, monthTitle } from './date'

export const trainingStats = (days: Record<string, string>, today: string) => {
  const dates = Object.keys(days).sort()
  let streak = 0
  const cursor = new Date(`${today}T12:00:00Z`)
  while (days[dateKey(cursor)]) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  const month = today.slice(0, 7)
  return { total: dates.length, streak, month: dates.filter((date) => date.startsWith(month)).length, last: dates[dates.length - 1] ?? '' }
}

export const trainingReport = (days: Record<string, string>, today: string, cityName: string) => {
  const stats = trainingStats(days, today)
  const byMonth = new Map<string, number[]>()
  Object.keys(days)
    .sort()
    .forEach((date) => {
      const [year, month, day] = date.split('-')
      byMonth.set(`${year}-${month}`, [...(byMonth.get(`${year}-${month}`) ?? []), Number(day)])
    })
  const lines = [
    `Силовые тренировки — ${cityName}`,
    `Календарь отмечен по датам, время считается местным.`,
    '',
    `Всего отмечено: ${stats.total}`,
    `Подряд сейчас: ${stats.streak}`,
    `В этом месяце: ${stats.month}`,
    `Последняя тренировка: ${stats.last ? formatShortDate(stats.last) : 'пока нет'}`,
  ]
  if (byMonth.size) {
    lines.push('', 'По месяцам:')
    byMonth.forEach((numbers, key) => {
      const [year, month] = key.split('-').map(Number)
      lines.push(`${monthTitle(year, month - 1)} — ${numbers.join(', ')}`)
    })
  }
  return lines.join('\n')
}

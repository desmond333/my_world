export const formatFullDate = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date)

export const formatDay = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('ru-RU', { timeZone: timezone, day: '2-digit' }).format(date)

export const formatMonth = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('ru-RU', { timeZone: timezone, month: 'long' }).format(date)

export const formatClock = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('ru-RU', { timeZone: timezone, hour: '2-digit', minute: '2-digit' }).format(date)

export const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))

export const dayName = (date: string, index: number) => {
  if (index === 0) return 'Сегодня'
  if (index === 1) return 'Завтра'
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)).replace('.', '')
}

export const dayMonth = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))

export const dateKey = (date: Date) => date.toISOString().slice(0, 10)

export const monthTitle = (year: number, month: number) =>
  new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)))

export const monthMatrix = (year: number, month: number) => {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: ({ key: string; day: number } | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= total; day += 1) {
    cells.push({ key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, day })
  }
  return cells
}

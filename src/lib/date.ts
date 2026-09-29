export const formatFullDate = (date: Date, timezone: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date)

export const formatDay = (date: Date, timezone: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, { timeZone: timezone, day: '2-digit' }).format(date)

export const formatMonth = (date: Date, timezone: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, { timeZone: timezone, month: 'long' }).format(date)

export const formatClock = (date: Date, timezone: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: '2-digit', minute: '2-digit' }).format(date)

export const formatShortDate = (date: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))

export const formatAddedAt = (iso: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const dayName = (date: string, index: number, locale: string = 'ru-RU') => {
  if (index === 0) return locale.startsWith('en') ? 'Today' : 'Сегодня'
  if (index === 1) return locale.startsWith('en') ? 'Tomorrow' : 'Завтра'
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)).replace('.', '')
}

export const dayMonth = (date: string, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))

export const dateKey = (date: Date) => date.toISOString().slice(0, 10)

export const sortByNewestKey = (first: string, second: string) => (first < second ? 1 : first > second ? -1 : 0)

export const seedFromDate = (date: string) => date.split('-').reduce((sum, value) => sum + Number(value), 0)

export const monthTitle = (year: number, month: number, locale: string = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)))

export const monthKey = (date: Date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const monthKeyParts = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return { year: year ?? 0, month: month ?? 0 }
}

export const monthName = (key: string, locale: string = 'ru-RU') => {
  const { year, month } = monthKeyParts(key)
  return year && month ? monthTitle(year, month - 1, locale).replace(' г.', '') : key
}

export const monthShort = (key: string, locale: string = 'ru-RU') => monthName(key, locale).slice(0, 3)

export const monthDayLabel = (year: number, month: number, locale: string = 'ru-RU') => monthTitle(year, month, locale).split(' ')[0]

export const weekDayLabels = (locale: string = 'ru-RU') => {
  const monday = new Date(Date.UTC(2024, 0, 1))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)
    return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(date).replace('.', '')
  })
}

export const monthMatrix = (year: number, month: number) => {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: ({ key: string; day: number } | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= total; day += 1) {
    cells.push({ key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, day })
  }
  return cells
}

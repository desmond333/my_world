import type { Birthday } from '../data'

const birthdayDate = (birthday: Birthday, year: number) => {
  const [, month, day] = birthday.date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export const birthdayInfo = (birthday: Birthday, now: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(
    now,
  )
  const today = new Date(
    Date.UTC(
      Number(parts.find((part) => part.type === 'year')?.value),
      Number(parts.find((part) => part.type === 'month')?.value) - 1,
      Number(parts.find((part) => part.type === 'day')?.value),
    ),
  )
  let next = birthdayDate(birthday, today.getUTCFullYear())
  if (next < today) next = birthdayDate(birthday, today.getUTCFullYear() + 1)
  const days = Math.round((next.getTime() - today.getTime()) / 86400000)
  const status =
    days === 0
      ? 'сегодня'
      : days <= 7
        ? 'скоро'
        : days <= 14
          ? 'на следующей неделе'
          : next.getUTCMonth() === (today.getUTCMonth() + 1) % 12
            ? 'в следующем месяце'
            : 'нескоро'
  return { next, days, status }
}

export const displayBirthday = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))

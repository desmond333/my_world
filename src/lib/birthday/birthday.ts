import type { Birthday } from '../../data'
import { getTranslation, localeOf, type Lang } from '../i18n'

export type BirthdayStatus = 'today' | 'soon' | 'nextWeek' | 'nextMonth' | 'later'

const STATUS_KEYS: Record<BirthdayStatus, string> = {
  today: 'birthday.statusToday',
  soon: 'birthday.statusSoon',
  nextWeek: 'birthday.statusNextWeek',
  nextMonth: 'birthday.statusNextMonth',
  later: 'birthday.statusLater',
}

export const birthdayStatusLabel = (status: BirthdayStatus, lang: Lang = 'ru') => getTranslation(STATUS_KEYS[status], lang, status)

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
  const status: BirthdayStatus =
    days === 0
      ? 'today'
      : days <= 7
        ? 'soon'
        : days <= 14
          ? 'nextWeek'
          : next.getUTCMonth() === (today.getUTCMonth() + 1) % 12
            ? 'nextMonth'
            : 'later'
  return { next, days, status }
}

export const displayBirthday = (date: string, lang: Lang = 'ru') =>
  new Intl.DateTimeFormat(localeOf(lang), { day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))

import type { Currency, CurrencyRates, Subscription, SubscriptionPeriod } from '../data'
import { convert, formatMoney } from './finance'
import { formatShortDate } from './date'
import { getTranslation } from './i18n'
import { withCount } from './plural'

const DAY = 86400000

export const SUBSCRIPTION_PERIODS: SubscriptionPeriod[] = ['week', 'month', 'year']

export const PERIOD_LABELS: Record<SubscriptionPeriod, string> = { week: 'неделя', month: 'месяц', year: 'год' }

export const PERIOD_MONTHS: Record<SubscriptionPeriod, number> = { week: 52 / 12, month: 1, year: 1 / 12 }

export const isSubscriptionPeriod = (value: string): value is SubscriptionPeriod =>
  SUBSCRIPTION_PERIODS.includes(value as SubscriptionPeriod)

const toDate = (key: string) => new Date(`${key}T12:00:00Z`)

const toKey = (date: Date) => date.toISOString().slice(0, 10)

const addMonths = (date: Date, months: number) => {
  const next = new Date(date)
  const day = next.getUTCDate()
  next.setUTCDate(1)
  next.setUTCMonth(next.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate()
  next.setUTCDate(Math.min(day, lastDay))
  return next
}

export const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY)

export const nextChargeDate = (startedAt: string, period: SubscriptionPeriod, today: string) => {
  const start = toDate(startedAt)
  const now = toDate(today)
  if (period === 'week') {
    const passed = Math.floor((now.getTime() - start.getTime()) / DAY)
    return toKey(new Date(start.getTime() + (Math.floor(passed / 7) + 1) * 7 * DAY))
  }
  const step = period === 'year' ? 12 : 1
  const months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth())
  let next = addMonths(start, months + step)
  while (next.getTime() <= now.getTime()) next = addMonths(next, step)
  return toKey(next)
}

export const monthPrice = (sub: Subscription, currency: Currency, rates: CurrencyRates) =>
  convert(sub.price, sub.currency, currency, rates) * PERIOD_MONTHS[sub.period]

export type SubscriptionStatus = 'later' | 'soon' | 'today' | 'over' | 'stopped'

export type SubscriptionView = {
  sub: Subscription
  status: SubscriptionStatus
  daysLeft: number
  charge: string
  deadline: string
  monthly: number
  note: string
}

export const subscriptionView = (
  sub: Subscription,
  today: string,
  currency: Currency,
  rates: CurrencyRates,
  lang: 'ru' | 'en' = 'ru',
): SubscriptionView => {
  const charge = nextChargeDate(sub.startedAt, sub.period, today)
  const monthly = monthPrice(sub, currency, rates)
  const stopped = Boolean(sub.until)
  const deadline = stopped ? sub.until : charge
  const daysLeft = daysBetween(today, deadline)
  const status: SubscriptionStatus =
    daysLeft < 0 ? (stopped ? 'stopped' : 'over') : daysLeft === 0 ? 'today' : daysLeft <= 7 ? 'soon' : 'later'
  const locale = lang === 'en' ? 'en-US' : 'ru-RU'
  const note = stopped
    ? getTranslation('subscription.note.until', lang).replace('{date}', formatShortDate(sub.until, locale))
    : getTranslation('subscription.note.cancel', lang).replace('{date}', formatShortDate(charge, locale))
  return { sub, status, daysLeft, charge, deadline, monthly, note }
}

export const subscriptionSummary = (
  subs: Subscription[],
  today: string,
  currency: Currency,
  rates: CurrencyRates,
  lang: 'ru' | 'en' = 'ru',
) => {
  const views = subs.map((sub) => subscriptionView(sub, today, currency, rates, lang))
  const monthTotal = views.reduce((sum, view) => sum + view.monthly, 0)
  const active = views.filter((view) => view.status !== 'stopped' && view.status !== 'over')
  const closest = [...active].sort((first, second) => first.daysLeft - second.daysLeft)[0]
  return { monthTotal, activeCount: active.length, closest, views }
}

const DAY_FORMS: [string, string, string] = ['день', 'дня', 'дней']

export const leftLabel = (daysLeft: number, lang: 'ru' | 'en' = 'ru') => {
  const count = Math.abs(daysLeft)
  if (lang === 'en') {
    return `${count} ${count === 1 ? 'day' : 'days'}`
  }
  return withCount(count, DAY_FORMS)
}

export const leftText = (daysLeft: number, lang: 'ru' | 'en' = 'ru') => {
  if (lang === 'en') {
    return daysLeft < 0 ? `${leftLabel(daysLeft, lang)} overdue` : `in ${leftLabel(daysLeft, lang)}`
  }
  return daysLeft < 0 ? `просрочено на ${leftLabel(daysLeft, lang)}` : `через ${leftLabel(daysLeft, lang)}`
}

export const statusLabel = (status: SubscriptionStatus, lang: 'ru' | 'en' = 'ru') => {
  if (lang === 'en') {
    return status === 'stopped'
      ? 'canceled'
      : status === 'over'
        ? 'overdue'
        : status === 'today'
          ? 'today'
          : status === 'soon'
            ? 'soon'
            : 'active'
  }
  return status === 'stopped'
    ? 'отменена'
    : status === 'over'
      ? 'просрочена'
      : status === 'today'
        ? 'сегодня'
        : status === 'soon'
          ? 'скоро'
          : 'платно'
}

export const priceText = (sub: Subscription, lang: 'ru' | 'en' = 'ru') => {
  const periodLabel =
    lang === 'en' ? (sub.period === 'week' ? 'week' : sub.period === 'month' ? 'month' : 'year') : PERIOD_LABELS[sub.period]
  return `${formatMoney(sub.price, sub.currency)} / ${periodLabel}`
}

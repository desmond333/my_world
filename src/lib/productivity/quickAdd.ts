import type { RepeatInterval, TaskPriority } from '../../data'
import type { Lang } from '../i18n'
import { shiftDate } from './productivity'

export type QuickAddResult = {
  title: string
  date: string
  priority: TaskPriority
  repeat: RepeatInterval
}

const WEEKDAY_RU: Record<string, number> = {
  понедельник: 1,
  понедельника: 1,
  вторник: 2,
  вторника: 2,
  среда: 3,
  среды: 3,
  четверг: 4,
  четверга: 4,
  пятница: 5,
  пятницу: 5,
  пятницы: 5,
  суббота: 6,
  субботу: 6,
  воскресенье: 0,
  воскресенья: 0,
}

const WEEKDAY_SHORT: Record<string, number> = { пн: 1, вт: 2, ср: 3, чт: 4, пт: 5, сб: 6, вс: 0 }

const WEEKDAY_EN: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
}

const REPEAT_RU: [RepeatInterval, string[]][] = [
  ['weekdays', ['по будням', 'по рабочим дням', 'каждый будний день']],
  ['daily', ['каждый день', 'ежедневно']],
  ['weekly', ['каждую неделю', 'еженедельно', 'раз в неделю']],
  ['monthly', ['каждый месяц', 'ежемесячно', 'раз в месяц']],
]

const REPEAT_EN: [RepeatInterval, string[]][] = [
  ['weekdays', ['weekdays', 'every weekday', 'every work day']],
  ['daily', ['daily', 'every day']],
  ['weekly', ['weekly', 'every week']],
  ['monthly', ['monthly', 'every month']],
]

const HIGH_RU = ['срочно', 'важно', 'важное', 'важная', 'важный', 'горящее']
const LOW_RU = ['не срочно', 'несрочно', 'когда-нибудь', 'потом', 'неважно', 'не важно', 'нежирное']
const HIGH_EN = ['urgent', 'important', 'asap']
const LOW_EN = ['someday', 'not urgent', 'low priority']

const num = (value: string | undefined) => (value ? Number(value) : 0)

const strip = (value: string) =>
  value
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[\s,;:.]+|[\s,;:]+$/g, '')
    .trim()

const nextWeekday = (today: string, target: number) => {
  const day = new Date(`${today}T12:00:00Z`).getUTCDay()
  return shiftDate(today, (target - day + 7) % 7 || 7)
}

const buildIso = (year: number, month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1 || day > 31) return ''
  const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const check = new Date(`${candidate}T12:00:00Z`)
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return ''
  return candidate
}

const phrase = (words: string[], prefix = '') =>
  new RegExp(`(?<![\\p{L}\\p{N}_])(?:${prefix})?(${words.join('|')})(?![\\p{L}\\p{N}_])`, 'iu')

const word = (body: string) => new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, 'iu')

export const parseQuickAdd = (input: string, today: string, lang: Lang = 'ru'): QuickAddResult => {
  const result: QuickAddResult = { title: input.trim(), date: '', priority: 'medium', repeat: 'none' }
  if (!input.trim() || !today) return result

  let text = ` ${input} `
  const cut = (re: RegExp) => {
    const match = text.match(re)
    if (match) text = text.replace(re, ' ')
    return match
  }

  for (const [repeat, words] of lang === 'en' ? REPEAT_EN : REPEAT_RU) {
    if (cut(phrase(words))) {
      result.repeat = repeat
      break
    }
  }

  if (cut(word('послезавтра|day after tomorrow'))) result.date = shiftDate(today, 2)
  else if (cut(word('завтра|tomorrow'))) result.date = shiftDate(today, 1)
  else if (cut(word('сегодня|today'))) result.date = today
  else {
    const relative = cut(/(?<!\S)(?:через|in|after)\s+(\d{1,3})\s*(?:дн[\p{L}\p{N}_]*|day|days)(?!\S)/iu)
    if (relative) result.date = shiftDate(today, num(relative[1]))
  }

  if (!result.date) {
    const iso = cut(/(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/)
    if (iso) result.date = buildIso(num(iso[1]), num(iso[2]), num(iso[3]))

    const short = cut(/(?<!\d)(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?(?!\d)/)
    if (short) {
      const rawYear = short[3] ? num(short[3]) : 0
      const year = rawYear ? (rawYear < 100 ? 2000 + rawYear : rawYear) : Number(today.slice(0, 4))
      result.date = buildIso(year, num(short[2]), num(short[1]))
    }
  }

  if (!result.date) {
    const nextWeek = cut(word('на следующей неделе|следующую неделю|next week'))
    if (nextWeek) result.date = nextWeekday(today, 1)
    else {
      const table = lang === 'en' ? WEEKDAY_EN : WEEKDAY_RU
      const weekday = cut(phrase(Object.keys(table), 'в\\s+'))
      if (weekday) result.date = nextWeekday(today, table[weekday[1].toLowerCase()])
      else if (lang === 'ru') {
        const shortWeekday = cut(phrase(Object.keys(WEEKDAY_SHORT), 'в\\s+'))
        if (shortWeekday) result.date = nextWeekday(today, WEEKDAY_SHORT[shortWeekday[1].toLowerCase()])
      }
    }
  }

  const level = cut(/!([1-3])?/u)
  if (level) {
    const value = num(level[1])
    result.priority = value === 2 ? 'medium' : value === 3 ? 'low' : 'high'
  } else if (cut(phrase(lang === 'en' ? HIGH_EN : HIGH_RU))) result.priority = 'high'
  else if (cut(phrase(lang === 'en' ? LOW_EN : LOW_RU))) result.priority = 'low'

  text = text.replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, ' ')
  result.title = strip(text)
  return result
}

export const QUICK_ADD_EXAMPLE: Record<Lang, string> = {
  ru: 'Например: отчёт по проекту завтра ! каждую неделю',
  en: 'For example: project report tomorrow ! every week',
}

const DATE_PHRASES: Record<Lang, string[]> = {
  ru: ['сегодня', 'завтра', 'послезавтра', 'на следующей неделе', 'следующую неделю', 'через неделю'],
  en: ['today', 'tomorrow', 'day after tomorrow', 'next week', 'in a week', 'in', 'days'],
}

const DATE_KEYWORDS: Record<Lang, Record<string, string>> = {
  ru: {
    today: 'сегодня',
    tomorrow: 'завтра',
    afterTomorrow: 'послезавтра',
    nextWeek: 'на следующей неделе',
    plusWeek: 'через неделю',
  },
  en: {
    today: 'today',
    tomorrow: 'tomorrow',
    afterTomorrow: 'day after tomorrow',
    nextWeek: 'next week',
    plusWeek: 'in a week',
  },
}

const PRIORITY_KEYWORDS: Record<Lang, Record<TaskPriority, string>> = {
  ru: { high: '!', medium: '!2', low: '!3' },
  en: { high: '!', medium: '!2', low: '!3' },
}

const REPEAT_KEYWORDS: Record<Lang, Record<Exclude<RepeatInterval, 'none'>, string>> = {
  ru: { daily: 'каждый день', weekdays: 'по будням', weekly: 'каждую неделю', monthly: 'каждый месяц' },
  en: { daily: 'every day', weekdays: 'weekdays', weekly: 'every week', monthly: 'every month' },
}

export const QUICK_KEYWORDS = {
  date: (lang: Lang) => DATE_KEYWORDS[lang],
  priority: (lang: Lang) => PRIORITY_KEYWORDS[lang],
  repeat: (lang: Lang) => REPEAT_KEYWORDS[lang],
} as const

export type QuickKeywordKind = 'date' | 'priority' | 'repeat'

export const applyKeyword = (text: string, kind: QuickKeywordKind, word: string, lang: Lang): string => {
  let base = text
  if (kind === 'priority') base = base.replace(/!([1-3])?/gu, ' ')
  if (kind === 'date') base = base.replace(new RegExp(phrase(DATE_PHRASES[lang]).source, 'giu'), ' ')
  if (kind === 'repeat') {
    const words = (lang === 'en' ? REPEAT_EN : REPEAT_RU).flatMap(([, list]) => list)
    base = base.replace(new RegExp(phrase(words).source, 'giu'), ' ')
  }
  return `${base} ${word}`.replace(/\s{2,}/g, ' ').trim()
}

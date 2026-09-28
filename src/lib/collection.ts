import type { CollectionItem, CollectionListKey, PeriodOption, SearchCandidate } from '../data'

export const ANY_TAG = 'any'

export const otherCollectionList = (key: CollectionListKey): CollectionListKey => (key === 'wishlist' ? 'watched' : 'wishlist')

export const toCollectionItem = (candidate: SearchCandidate): CollectionItem => ({
  ...candidate,
  addedAt: new Date().toISOString(),
})

const byLocale = (first: string, second: string) => first.localeCompare(second, 'ru')

export const sortByLocale = (values: string[]) => [...values].sort(byLocale)

export const tagOptions = (items: CollectionItem[]) => sortByLocale([...new Set(items.flatMap((item) => item.tags))])

export const matchesPeriod = (year: number | null, period: PeriodOption) => {
  if (period.from === null && period.to === null) return true
  if (year === null) return false
  if (period.from !== null && year < period.from) return false
  if (period.to !== null && year >= period.to) return false
  return true
}

export const matchesTag = (item: CollectionItem, tag: string) => tag === ANY_TAG || item.tags.includes(tag)

export const filterItems = (items: CollectionItem[], tag: string, period: PeriodOption) =>
  items.filter((item) => matchesTag(item, tag) && matchesPeriod(item.year, period))

export const reorderItems = (items: CollectionItem[], orderedIds: string[]) => {
  const wanted = new Set(orderedIds)
  const slots: number[] = []
  items.forEach((item, index) => {
    if (wanted.has(item.id)) slots.push(index)
  })
  if (slots.length !== orderedIds.length) return items
  const byId = new Map(items.map((item) => [item.id, item]))
  const next = [...items]
  slots.forEach((slot, position) => {
    const item = byId.get(orderedIds[position])
    if (item) next[slot] = item
  })
  return next
}

export const yearLabel = (year: number | null) => (year === null ? 'год неизвестен' : String(year))

export const formatScore = (score: number | null | undefined, digits = 1) => (score && score > 0 ? score.toFixed(digits) : null)

const SEARCH_ENGINE = 'https://yandex.ru/search/?text='

export const onlineSearchUrl = (title: string, extra = 'смотреть онлайн') =>
  `${SEARCH_ENGINE}${encodeURIComponent(`${title} ${extra}`.trim())}`

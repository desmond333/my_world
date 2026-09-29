import type { CollectionDetails, SearchCandidate } from '../../data'
import { getFallbackBookDetails, searchFallbackBooks } from './fallbackBooks'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const apiKey = (import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? '').trim()

export const MIN_BOOKS_QUERY_LENGTH = 2

type GoogleBookVolume = {
  id: string
  volumeInfo?: {
    title?: string
    subtitle?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    categories?: string[]
    pageCount?: number
    averageRating?: number
    ratingsCount?: number
    language?: string
    imageLinks?: {
      smallThumbnail?: string
      thumbnail?: string
      medium?: string
      large?: string
    }
    industryIdentifiers?: { type: string; identifier: string }[]
    infoLink?: string
    previewLink?: string
  }
}

type GoogleBooksSearchResponse = {
  totalItems?: number
  items?: GoogleBookVolume[]
}

const cleanHtml = (text?: string) => {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .trim()
}

const buildUrl = (path: string, params: Record<string, string | number>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)))
  if (apiKey) query.set('key', apiKey)
  return `${GOOGLE_BOOKS_API}${path}?${query.toString()}`
}

const toCandidate = (item: GoogleBookVolume): SearchCandidate => {
  const info = item.volumeInfo ?? {}
  const authors = info.authors?.join(', ') ?? ''
  const publishedYear = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : null
  const thumbnail =
    info.imageLinks?.thumbnail?.replace('http:', 'https:') ?? info.imageLinks?.smallThumbnail?.replace('http:', 'https:') ?? null

  const rawDesc = cleanHtml(info.description)
  const shortDesc = rawDesc.length > 200 ? `${rawDesc.slice(0, 200)}…` : rawDesc

  return {
    id: item.id,
    title: info.title?.trim() || 'Без названия',
    subtitle: authors,
    description: shortDesc,
    imageUrl: thumbnail,
    year: publishedYear && Number.isFinite(publishedYear) ? publishedYear : null,
    tags: (info.categories ?? [])
      .flatMap((c) => c.split('/'))
      .map((c) => c.trim())
      .filter(Boolean),
    score: info.averageRating ? String(info.averageRating) : null,
  }
}

export const searchBooks = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const term = query.trim()
  if (term.length < MIN_BOOKS_QUERY_LENGTH) return []

  try {
    const url = buildUrl('', {
      q: term,
      langRestrict: 'ru',
      maxResults: 20,
      printType: 'books',
    })

    const response = await fetch(url, { signal })
    if (!response.ok) {
      const fallback = searchFallbackBooks(term)
      if (fallback.length > 0) return fallback
      throw new Error(`Google Books API ответил ошибкой ${response.status}`)
    }

    const data = (await response.json()) as GoogleBooksSearchResponse
    const items = data.items ?? []
    if (items.length === 0) {
      return searchFallbackBooks(term)
    }

    return items.map(toCandidate)
  } catch (error) {
    if (signal?.aborted) throw error
    const fallback = searchFallbackBooks(term)
    if (fallback.length > 0) return fallback
    throw error
  }
}

export const fetchBookDetails = async (id: string, signal?: AbortSignal): Promise<CollectionDetails> => {
  const fallback = getFallbackBookDetails(id)
  if (fallback) return fallback

  const url = apiKey ? `${GOOGLE_BOOKS_API}/${id}?key=${encodeURIComponent(apiKey)}` : `${GOOGLE_BOOKS_API}/${id}`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные книги (ошибка ${response.status})`)
  }

  const raw = (await response.json()) as GoogleBookVolume
  const info = raw.volumeInfo ?? {}
  const authors = (info.authors ?? []).join(', ')

  const facts = [
    authors ? { label: 'Автор(ы)', value: authors } : null,
    info.publisher ? { label: 'Издатель', value: info.publisher } : null,
    info.publishedDate ? { label: 'Дата публикации', value: info.publishedDate } : null,
    info.pageCount ? { label: 'Страниц', value: String(info.pageCount) } : null,
    info.categories?.length ? { label: 'Жанры', value: info.categories.join(', ') } : null,
    info.language ? { label: 'Язык', value: info.language.toUpperCase() } : null,
    info.averageRating ? { label: 'Рейтинг', value: `★ ${info.averageRating}` } : null,
    info.ratingsCount ? { label: 'Оценок', value: info.ratingsCount.toLocaleString('ru-RU') } : null,
  ].filter((f): f is { label: string; value: string } => f !== null)

  const links = []
  if (info.previewLink) {
    links.push({ label: 'Google Книги (превью)', href: info.previewLink.replace('http:', 'https:') })
  } else if (info.infoLink) {
    links.push({ label: 'Google Книги', href: info.infoLink.replace('http:', 'https:') })
  }

  return {
    tagline: info.subtitle ?? authors,
    facts,
    overview: cleanHtml(info.description),
    links,
  }
}

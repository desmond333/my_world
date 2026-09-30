import type { CollectionDetails, SearchCandidate } from '../../data'
import { getFallbackBookDetails, searchFallbackBooks } from './fallbackBooks'
import { fetchBookDetails as fetchOpenLibraryDetails, searchBooks as searchOpenLibrary } from './openLibrary'

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
    language?: string
    imageLinks?: { smallThumbnail?: string; thumbnail?: string }
    previewLink?: string
    infoLink?: string
  }
}

type GoogleBooksSearchResponse = { items?: GoogleBookVolume[] }

const cleanHtml = (text?: string) =>
  (text ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .trim()

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

const searchGoogleBooks = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const response = await fetch(buildUrl('', { q: query, langRestrict: 'ru', maxResults: 20, printType: 'books' }), { signal })
  if (!response.ok) {
    throw new Error(`Google Books API ответил ошибкой ${response.status}`)
  }
  const data = (await response.json()) as GoogleBooksSearchResponse
  return (data.items ?? []).map(toCandidate)
}

export const searchBooks = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const term = query.trim()
  if (term.length < MIN_BOOKS_QUERY_LENGTH) return []

  try {
    const results = await searchOpenLibrary(term, signal)
    if (results.length > 0) return results
  } catch (error) {
    if (signal?.aborted) throw error
  }

  try {
    const results = await searchGoogleBooks(term, signal)
    if (results.length > 0) return results
  } catch (error) {
    if (signal?.aborted) throw error
  }

  return searchFallbackBooks(term)
}

export const fetchBookDetails = async (id: string, signal?: AbortSignal): Promise<CollectionDetails> => {
  const fallback = getFallbackBookDetails(id)
  if (fallback) return fallback

  if (id.startsWith('ol')) {
    return fetchOpenLibraryDetails(id, signal)
  }

  const url = apiKey ? `${GOOGLE_BOOKS_API}/${id}?key=${encodeURIComponent(apiKey)}` : `${GOOGLE_BOOKS_API}/${id}`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные книги (ошибка ${response.status})`)
  }

  const raw = (await response.json()) as GoogleBookVolume
  const info = raw.volumeInfo ?? {}
  const authors = (info.authors ?? []).join(', ')
  const publisher = info.publisher ?? ''

  const facts = [
    authors ? { label: 'Автор(ы)', value: authors } : null,
    publisher ? { label: 'Издатель', value: publisher } : null,
    info.publishedDate ? { label: 'Дата публикации', value: info.publishedDate } : null,
    info.pageCount ? { label: 'Страниц', value: String(info.pageCount) } : null,
    info.categories?.length ? { label: 'Жанры', value: info.categories.join(', ') } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  const links = []
  if (info.previewLink) links.push({ label: 'Google Книги (превью)', href: info.previewLink.replace('http:', 'https:') })
  else if (info.infoLink) links.push({ label: 'Google Книги', href: info.infoLink })

  return {
    tagline: info.subtitle ?? authors,
    facts,
    overview: cleanHtml(info.description),
    links,
  }
}

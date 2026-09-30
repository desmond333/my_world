import type { CollectionDetails, SearchCandidate } from '../../data'

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_BOOK = 'https://openlibrary.org/books'
const COVER_BASE = 'https://covers.openlibrary.org/b/id'

export const MIN_BOOKS_QUERY_LENGTH = 2

type OpenLibraryDoc = {
  key?: string
  title?: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  ratings_average?: number
  ratings_count?: number
  number_of_pages_median?: number
  subject?: string[]
  first_sentence?: string[]
  edition_key?: string[]
}

type OpenLibrarySearchResponse = {
  numFound?: number
  docs?: OpenLibraryDoc[]
}

type OpenLibraryEdition = {
  description?: string | { value?: string }
  publishers?: { name?: string }[]
  publish_date?: string
  number_of_pages?: number
  subjects?: string[]
  physical_format?: string
}

const coverUrl = (coverId?: number, size: 'M' | 'L' = 'L') => (coverId ? `${COVER_BASE}/${coverId}-${size}.jpg` : null)

const clean = (text?: string) =>
  (text ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .trim()

const truncate = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit)}…` : text)

const subjectTags = (subjects: string[] = []) =>
  subjects
    .filter((item) => item.length <= 28)
    .slice(0, 6)
    .map((item) => item.trim())

const toCandidate = (doc: OpenLibraryDoc): SearchCandidate => {
  const description = clean(doc.first_sentence?.[0])
  return {
    id: doc.key?.replace('/works/', 'ol') ?? `ol-${doc.title ?? 'unknown'}`,
    title: doc.title?.trim() || 'Без названия',
    subtitle: doc.author_name?.join(', ') ?? '',
    description: description ? truncate(description, 200) : '',
    imageUrl: coverUrl(doc.cover_i),
    year: doc.first_publish_year ?? null,
    tags: subjectTags(doc.subject),
    score: doc.ratings_average ? String(doc.ratings_average) : null,
  }
}

const searchUrl = (term: string) => {
  const query = new URLSearchParams({
    q: term,
    limit: '20',
    fields: 'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,number_of_pages_median,subject,first_sentence',
  })
  return `${OPEN_LIBRARY_SEARCH}?${query.toString()}`
}

export const searchBooks = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const term = query.trim()
  if (term.length < MIN_BOOKS_QUERY_LENGTH) return []

  const response = await fetch(searchUrl(term), { signal })
  if (!response.ok) {
    throw new Error(`Open Library ответил ошибкой ${response.status}`)
  }

  const data = (await response.json()) as OpenLibrarySearchResponse
  const candidates = (data.docs ?? []).filter((doc) => doc.title).map(toCandidate)
  return candidates.sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)))
}

export const fetchBookDetails = async (id: string, signal?: AbortSignal): Promise<CollectionDetails> => {
  const workId = id.startsWith('ol') ? id.replace(/^ol/, '') : id
  const response = await fetch(`${OPEN_LIBRARY_BOOK}/${encodeURIComponent(workId)}.json`, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные книги (ошибка ${response.status})`)
  }

  const raw = (await response.json()) as OpenLibraryEdition & { description?: string | { value?: string } }
  const description = typeof raw.description === 'string' ? raw.description : (raw.description?.value ?? '')
  const publisher = raw.publishers?.[0]?.name ?? ''

  const facts = [
    publisher ? { label: 'Издатель', value: publisher } : null,
    raw.publish_date ? { label: 'Дата публикации', value: raw.publish_date } : null,
    raw.number_of_pages ? { label: 'Страниц', value: String(raw.number_of_pages) } : null,
    raw.physical_format ? { label: 'Формат', value: raw.physical_format } : null,
    raw.subjects?.length ? { label: 'Жанры', value: subjectTags(raw.subjects).join(', ') } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return {
    tagline: publisher,
    facts,
    overview: clean(description),
    links: [{ label: 'Open Library', href: `https://openlibrary.org/works/${workId}` }],
  }
}

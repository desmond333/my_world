import type { CollectionDetails, SearchCandidate } from '../../data'
import { getFallbackGameDetails, searchFallbackGames } from './fallbackGames'

const RAWG_API = 'https://api.rawg.io/api'
const apiKey = (import.meta.env.VITE_RAWG_API_KEY ?? '').trim()

export const MIN_GAMES_QUERY_LENGTH = 2

export const MISSING_RAWG_KEY_MESSAGE =
  'RAWG API не настроен: укажи VITE_RAWG_API_KEY в .env. Поиск работает по локальной базе шедевров на английском языке.'

export const isRawgConfigured = () => apiKey.length > 0

type RawgGame = {
  id: number
  name?: string
  background_image?: string | null
  released?: string
  rating?: number
  metacritic?: number | null
  genres?: { id: number; name: string }[]
  platforms?: { platform: { id: number; name: string } }[]
}

type RawgSearchResponse = {
  count?: number
  results?: RawgGame[]
}

type RawgGameDetails = {
  id: number
  name?: string
  description_raw?: string
  description?: string
  released?: string
  background_image?: string | null
  website?: string | null
  rating?: number
  metacritic?: number | null
  metacritic_url?: string | null
  playtime?: number
  genres?: { id: number; name: string }[]
  platforms?: { platform: { id: number; name: string } }[]
  developers?: { id: number; name: string }[]
  publishers?: { id: number; name: string }[]
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

const toCandidate = (raw: RawgGame): SearchCandidate => {
  const genres = (raw.genres ?? []).map((g) => g.name).filter(Boolean)
  const platforms = (raw.platforms ?? []).map((p) => p.platform.name).filter(Boolean)
  const year = raw.released ? parseInt(raw.released.slice(0, 4), 10) : null
  const score = raw.rating ? raw.rating.toFixed(1) : raw.metacritic ? (raw.metacritic / 10).toFixed(1) : null

  return {
    id: String(raw.id),
    title: raw.name?.trim() || 'Untitled',
    subtitle: genres.slice(0, 3).join(', ') || platforms.slice(0, 3).join(', '),
    description: platforms.length > 0 ? `Platforms: ${platforms.slice(0, 4).join(', ')}` : '',
    imageUrl: raw.background_image ?? null,
    year: year && Number.isFinite(year) ? year : null,
    tags: [...genres, ...platforms].slice(0, 5),
    score,
  }
}

export const searchGames = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const term = query.trim()
  if (term.length < MIN_GAMES_QUERY_LENGTH) return []

  if (!isRawgConfigured()) {
    return searchFallbackGames(term)
  }

  try {
    const url = `${RAWG_API}/games?search=${encodeURIComponent(term)}&key=${encodeURIComponent(apiKey)}&page_size=20`
    const response = await fetch(url, { signal })
    if (!response.ok) {
      const fallback = searchFallbackGames(term)
      if (fallback.length > 0) return fallback
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = (await response.json()) as RawgSearchResponse
    const results = (data.results ?? []).map(toCandidate)
    if (results.length > 0) return results
    return searchFallbackGames(term)
  } catch (error) {
    if (signal?.aborted) throw error
    const fallback = searchFallbackGames(term)
    if (fallback.length > 0) return fallback
    throw error
  }
}

export const fetchGameDetails = async (id: string, signal?: AbortSignal): Promise<CollectionDetails> => {
  const fallback = getFallbackGameDetails(id)
  if (fallback) return fallback

  if (!isRawgConfigured()) {
    throw new Error(MISSING_RAWG_KEY_MESSAGE)
  }

  const url = `${RAWG_API}/games/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Failed to load game details (${response.status})`)
  }

  const raw = (await response.json()) as RawgGameDetails
  const genres = (raw.genres ?? []).map((g) => g.name).join(', ')
  const platforms = (raw.platforms ?? []).map((p) => p.platform.name).join(', ')
  const developers = (raw.developers ?? []).map((d) => d.name).join(', ')
  const publishers = (raw.publishers ?? []).map((p) => p.name).join(', ')

  const facts = [
    developers ? { label: 'Developer', value: developers } : null,
    publishers ? { label: 'Publisher', value: publishers } : null,
    raw.released ? { label: 'Release Date', value: raw.released } : null,
    genres ? { label: 'Genres', value: genres } : null,
    platforms ? { label: 'Platforms', value: platforms } : null,
    raw.metacritic ? { label: 'Metacritic', value: `${raw.metacritic} / 100` } : null,
    raw.rating ? { label: 'RAWG Rating', value: `★ ${raw.rating} / 5` } : null,
    raw.playtime ? { label: 'Playtime', value: `~${raw.playtime} hours` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null)

  const links = []
  if (raw.website) {
    links.push({ label: 'Official Website', href: raw.website })
  }
  if (raw.metacritic_url) {
    links.push({ label: 'Metacritic', href: raw.metacritic_url })
  }

  return {
    tagline: developers || publishers || '',
    facts,
    overview: raw.description_raw?.trim() || cleanHtml(raw.description),
    links,
  }
}

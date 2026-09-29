import type { SearchCandidate } from '../data'
import { formatScore, sortByLocale } from '../lib/collection'
import { getFallbackMovieDetails, searchFallbackMovies } from './fallbackMovies'

const TMDB_API = 'https://api.themoviedb.org/3'
const IMAGE_CDN = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_CDN = 'https://image.tmdb.org/t/p/w1280'
const LANGUAGE = 'ru-RU'

const proxyUrl = (import.meta.env.VITE_TMDB_PROXY_URL ?? '').trim().replace(/\/+$/, '')
const token = (import.meta.env.VITE_TMDB_TOKEN ?? '').trim()
const usesProxy = proxyUrl.length > 0
const usesBearer = !usesProxy && token.startsWith('eyJ')

export const MIN_QUERY_LENGTH = 2

export const MISSING_KEY_MESSAGE =
  'TMDB не настроен: укажи VITE_TMDB_PROXY_URL (адрес воркера) или VITE_TMDB_TOKEN в .env и перезапусти dev-сервер.'

type TmdbMovie = {
  id: number
  title?: string
  original_title?: string
  overview?: string
  poster_path?: string | null
  release_date?: string
  genre_ids?: number[]
  vote_average?: number
}

type TmdbSearchResponse = { results?: TmdbMovie[] }

type TmdbGenreResponse = { genres?: { id: number; name: string }[] }

type TmdbCountry = { iso_3166_1: string; name: string }

type TmdbMovieDetails = {
  id: number
  title?: string
  original_title?: string
  tagline?: string
  overview?: string
  runtime?: number | null
  status?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  budget?: number
  revenue?: number
  original_language?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genres?: { id: number; name: string }[]
  production_countries?: TmdbCountry[]
  origin_country?: string[]
  imdb_id?: string | null
  homepage?: string | null
}

export type MovieDetails = {
  id: string
  title: string
  originalTitle: string
  tagline: string
  overview: string
  runtimeMinutes: number | null
  releaseDate: string
  status: string
  score: string | null
  votes: number | null
  budget: number | null
  revenue: number | null
  genres: string[]
  countries: TmdbCountry[]
  originalLanguage: string
  imageUrl: string | null
  backdropUrl: string | null
  imdbId: string | null
  homepage: string | null
}

const MOVIE_ID_PATTERN = /^\d{1,9}$/

type GenreNames = Map<number, string>

export const isTmdbConfigured = () => usesProxy || token.length > 0

const withParams = (base: string, path: string, params: Record<string, string | number | boolean>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)))
  return query.size > 0 ? `${base}${path}?${query}` : `${base}${path}`
}

const buildUrl = (path: string, params: Record<string, string | number | boolean>) => {
  if (usesProxy) return withParams(proxyUrl, path, params)
  const target: Record<string, string | number | boolean> = { language: LANGUAGE, ...params }
  if (!usesBearer) target.api_key = token
  return withParams(TMDB_API, path, target)
}

const buildHeaders = (): Record<string, string> => {
  if (usesProxy) return { Accept: 'application/json' }
  if (!usesBearer) return { Accept: 'application/json' }
  return { Accept: 'application/json', Authorization: `Bearer ${token}` }
}

const describeStatus = (status: number) => {
  if (status === 401 || status === 403) return 'TMDB не принял ключ. Обнови VITE_TMDB_PROXY_URL или VITE_TMDB_TOKEN в .env.'
  if (status === 429) return 'Слишком много запросов к TMDB. Подожди немного.'
  return `TMDB ответил ошибкой ${status}.`
}

const request = async <T>(path: string, params: Record<string, string | number | boolean>, signal?: AbortSignal) => {
  if (!isTmdbConfigured()) throw new Error(MISSING_KEY_MESSAGE)
  let response: Response
  try {
    response = await fetch(buildUrl(path, params), { headers: buildHeaders(), signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Не удалось связаться с TMDB. Проверь соединение.', { cause: error })
  }
  if (!response.ok) throw new Error(describeStatus(response.status))
  return (await response.json()) as T
}

const parseYear = (value?: string) => {
  const year = Number((value ?? '').slice(0, 4))
  return year > 0 ? year : null
}

let genreCache: GenreNames | null = null

const loadGenreNames = async (signal?: AbortSignal): Promise<GenreNames> => {
  if (genreCache) return genreCache
  const data = await request<TmdbGenreResponse>('/genre/movie/list', {}, signal)
  genreCache = new Map((data.genres ?? []).map((genre) => [genre.id, genre.name]))
  return genreCache
}

const toCandidate = (raw: TmdbMovie, genreNames: GenreNames): SearchCandidate => ({
  id: String(raw.id),
  title: (raw.title ?? raw.original_title ?? '').trim() || 'Без названия',
  subtitle: (raw.original_title ?? '').trim(),
  description: (raw.overview ?? '').trim(),
  imageUrl: raw.poster_path ? `${IMAGE_CDN}${raw.poster_path}` : null,
  year: parseYear(raw.release_date),
  tags: sortByLocale((raw.genre_ids ?? []).map((id) => genreNames.get(id) ?? '').filter(Boolean)),
  score: formatScore(raw.vote_average),
})

export const searchMovies = async (query: string, signal?: AbortSignal): Promise<SearchCandidate[]> => {
  const term = query.trim()
  if (term.length < MIN_QUERY_LENGTH) return []

  if (!isTmdbConfigured()) {
    return searchFallbackMovies(term)
  }

  try {
    const params: Record<string, string | number | boolean> = { query: term, page: 1 }
    if (!usesProxy) params.include_adult = false
    const [data, genreNames] = await Promise.all([
      request<TmdbSearchResponse>('/search/movie', params, signal),
      loadGenreNames(signal).catch(() => new Map<number, string>()),
    ])
    const results = (data.results ?? []).map((raw) => toCandidate(raw, genreNames))
    if (results.length > 0) return results
    return searchFallbackMovies(term)
  } catch (error) {
    if (signal?.aborted) throw error
    const fallbackResults = searchFallbackMovies(term)
    if (fallbackResults.length > 0) {
      return fallbackResults
    }
    throw error
  }
}

const toDetails = (raw: TmdbMovieDetails): MovieDetails => ({
  id: String(raw.id),
  title: (raw.title ?? raw.original_title ?? '').trim() || 'Без названия',
  originalTitle: (raw.original_title ?? '').trim(),
  tagline: (raw.tagline ?? '').trim(),
  overview: (raw.overview ?? '').trim(),
  runtimeMinutes: raw.runtime && raw.runtime > 0 ? raw.runtime : null,
  releaseDate: (raw.release_date ?? '').trim(),
  status: (raw.status ?? '').trim(),
  score: formatScore(raw.vote_average),
  votes: raw.vote_count && raw.vote_count > 0 ? raw.vote_count : null,
  budget: raw.budget && raw.budget > 0 ? raw.budget : null,
  revenue: raw.revenue && raw.revenue > 0 ? raw.revenue : null,
  genres: sortByLocale((raw.genres ?? []).map((genre) => genre.name).filter(Boolean)),
  countries: raw.production_countries ?? raw.origin_country?.map((iso) => ({ iso_3166_1: iso, name: iso })) ?? [],
  originalLanguage: (raw.original_language ?? '').trim(),
  imageUrl: raw.poster_path ? `${IMAGE_CDN}${raw.poster_path}` : null,
  backdropUrl: raw.backdrop_path ? `${BACKDROP_CDN}${raw.backdrop_path}` : null,
  imdbId: (raw.imdb_id ?? '').trim() || null,
  homepage: (raw.homepage ?? '').trim() || null,
})

export const fetchMovieDetails = async (id: string, signal?: AbortSignal): Promise<MovieDetails> => {
  const fallback = getFallbackMovieDetails(id)
  if (fallback) return fallback

  if (!MOVIE_ID_PATTERN.test(id)) throw new Error('Некорректный идентификатор фильма.')
  const raw = await request<TmdbMovieDetails>(`/movie/${id}`, {}, signal)
  return toDetails(raw)
}

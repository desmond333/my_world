import { Hono } from 'hono'
import type { Context } from 'hono'
import type { Env } from '../types'

const TMDB_API = 'https://api.themoviedb.org/3'
const LANGUAGE = 'ru-RU'

const SEARCH_MIN_LENGTH = 2
const SEARCH_MAX_LENGTH = 100
const MAX_PAGE = 10
const GENRE_CACHE_SECONDS = 86400
const SEARCH_CACHE_SECONDS = 600
const DETAILS_CACHE_SECONDS = 21600

const ALLOWED_ENDPOINTS = ['/search/movie', '/genre/movie/list'] as const
const MOVIE_DETAIL_PATTERN = /^\/movie\/(\d{1,9})$/

const readPage = (value: string | null) => {
  const parsed = Number(value ?? '1')
  if (!Number.isFinite(parsed)) return 1
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_PAGE)
}

const buildUpstreamParams = (path: string, url: URL) => {
  if (path === '/genre/movie/list') return new URLSearchParams()
  if (MOVIE_DETAIL_PATTERN.test(path)) return new URLSearchParams()
  const query = (url.searchParams.get('query') ?? '').trim()
  if (query.length < SEARCH_MIN_LENGTH || query.length > SEARCH_MAX_LENGTH) return null
  return new URLSearchParams({
    query,
    page: String(readPage(url.searchParams.get('page'))),
    include_adult: 'false',
  })
}

const cacheTtlFor = (path: string) => {
  if (path === '/genre/movie/list') return GENRE_CACHE_SECONDS
  if (MOVIE_DETAIL_PATTERN.test(path)) return DETAILS_CACHE_SECONDS
  return SEARCH_CACHE_SECONDS
}

const describeUpstreamFailure = (status: number) => {
  if (status === 401 || status === 403) {
    return 'TMDB отклонил токен воркера. Обнови TMDB_TOKEN через wrangler secret put.'
  }
  if (status === 429) {
    return 'TMDB временно ограничил запросы. Попробуй позже.'
  }
  return `TMDB ответил ошибкой ${status}.`
}

export const handleTmdbRequest = async (c: Context<{ Bindings: Env }>) => {
  const url = new URL(c.req.url)
  let subPath = url.pathname.replace(/^\/tmdb/, '')
  subPath = subPath.replace(/\/+$/, '') || '/'

  const isAllowed = ALLOWED_ENDPOINTS.includes(subPath as (typeof ALLOWED_ENDPOINTS)[number]) || MOVIE_DETAIL_PATTERN.test(subPath)

  if (!isAllowed) {
    return c.json({ error: 'Неизвестный endpoint' }, 404)
  }

  if (!c.env.TMDB_TOKEN) {
    return c.json({ error: 'В воркере не задан секрет TMDB_TOKEN' }, 500)
  }

  const params = buildUpstreamParams(subPath, url)
  if (!params) {
    return c.json({ error: `Запрос должен быть от ${SEARCH_MIN_LENGTH} до ${SEARCH_MAX_LENGTH} символов` }, 400)
  }

  const cache = caches.default
  const cacheKey = new Request(url.toString(), { method: 'GET' })
  const hit = await cache.match(cacheKey)

  if (hit) {
    const body = await hit.json()
    return c.json(body, 200, {
      'X-Cache': 'HIT',
      'Cache-Control': hit.headers.get('Cache-Control') ?? '',
    })
  }

  const upstream = new URL(`${TMDB_API}${subPath}`)
  upstream.searchParams.set('language', LANGUAGE)
  params.forEach((value, key) => upstream.searchParams.set(key, value))

  let response: Response
  try {
    response = await fetch(upstream.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${c.env.TMDB_TOKEN}`,
      },
    })
  } catch {
    return c.json({ error: 'Не удалось связаться с TMDB' }, 502)
  }

  if (!response.ok) {
    return c.json({ error: describeUpstreamFailure(response.status) }, 502)
  }

  const body = await response.json()
  const ttl = cacheTtlFor(subPath)
  const cacheable = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${ttl}`,
    },
  })

  c.executionCtx.waitUntil(cache.put(cacheKey, cacheable.clone()))

  return c.json(body, 200, {
    'X-Cache': 'MISS',
    'Cache-Control': `public, max-age=${ttl}`,
  })
}

export const tmdbRouter = new Hono<{ Bindings: Env }>()

tmdbRouter.get('/*', async (c) => handleTmdbRequest(c))

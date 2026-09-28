export interface Env {
  TMDB_TOKEN: string
  ALLOWED_ORIGIN: string
}

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

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
})

const json = (body: unknown, status: number, origin?: string, extra: Record<string, string> = {}) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8', ...extra }
  if (origin) Object.assign(headers, corsHeaders(origin))
  return new Response(JSON.stringify(body), { status, headers })
}

const resolveOrigin = (request: Request, env: Env) => {
  const allowed = (env.ALLOWED_ORIGIN ?? '').trim()
  if (!allowed || allowed === '*') return '*'
  const requestOrigin = request.headers.get('Origin') ?? ''
  return allowed
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(requestOrigin)
    ? requestOrigin
    : ''
}

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
  return new URLSearchParams({ query, page: String(readPage(url.searchParams.get('page'))), include_adult: 'false' })
}

const cacheTtlFor = (path: string) => {
  if (path === '/genre/movie/list') return GENRE_CACHE_SECONDS
  if (MOVIE_DETAIL_PATTERN.test(path)) return DETAILS_CACHE_SECONDS
  return SEARCH_CACHE_SECONDS
}

const describeUpstreamFailure = (status: number) => {
  if (status === 401 || status === 403) return 'TMDB отклонил токен воркера. Обнови TMDB_TOKEN через wrangler secret put.'
  if (status === 429) return 'TMDB временно ограничил запросы. Попробуй позже.'
  return `TMDB ответил ошибкой ${status}.`
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === 'OPTIONS') {
      const preflightOrigin = resolveOrigin(request, env)
      if (!preflightOrigin) return new Response(null, { status: 403 })
      return new Response(null, { status: 204, headers: corsHeaders(preflightOrigin) })
    }

    if (request.method !== 'GET') return json({ error: 'Метод не поддерживается' }, 405, '*', { Allow: 'GET, OPTIONS' })

    const origin = resolveOrigin(request, env)
    if (!origin) return json({ error: 'Источник запроса не разрешён' }, 403)

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '') || '/'
    const isAllowed = ALLOWED_ENDPOINTS.includes(path as (typeof ALLOWED_ENDPOINTS)[number]) || MOVIE_DETAIL_PATTERN.test(path)
    if (!isAllowed) return json({ error: 'Неизвестный endpoint' }, 404, origin)

    if (!env.TMDB_TOKEN) return json({ error: 'В воркере не задан секрет TMDB_TOKEN' }, 500, origin)

    const params = buildUpstreamParams(path, url)
    if (!params) return json({ error: `Запрос должен быть от ${SEARCH_MIN_LENGTH} до ${SEARCH_MAX_LENGTH} символов` }, 400, origin)

    const cache = caches.default
    const cacheKey = new Request(url.toString(), { method: 'GET' })
    const hit = await cache.match(cacheKey)
    if (hit) {
      const body = await hit.json()
      return json(body, 200, origin, { 'X-Cache': 'HIT', 'Cache-Control': hit.headers.get('Cache-Control') ?? '' })
    }

    const upstream = new URL(`${TMDB_API}${path}`)
    upstream.searchParams.set('language', LANGUAGE)
    params.forEach((value, key) => upstream.searchParams.set(key, value))

    let response: Response
    try {
      response = await fetch(upstream.toString(), {
        headers: { Accept: 'application/json', Authorization: `Bearer ${env.TMDB_TOKEN}` },
      })
    } catch {
      return json({ error: 'Не удалось связаться с TMDB' }, 502, origin)
    }

    if (!response.ok) return json({ error: describeUpstreamFailure(response.status) }, 502, origin)

    const body = await response.json()
    const ttl = cacheTtlFor(path)
    const cacheable = new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${ttl}` },
    })
    ctx.waitUntil(cache.put(cacheKey, cacheable.clone()))

    return json(body, 200, origin, { 'X-Cache': 'MISS', 'Cache-Control': `public, max-age=${ttl}` })
  },
} satisfies ExportedHandler<Env>

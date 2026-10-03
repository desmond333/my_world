import { STORAGE_KEYS } from '../../lib/storage'

const TOKEN_KEY = STORAGE_KEYS.accessToken

let inMemoryToken: string | null = null

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_TMDB_PROXY_URL ?? '').trim()
  return envUrl.replace(/\/+$/, '')
}

export const getAuthToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken
  if (typeof window !== 'undefined') {
    inMemoryToken = localStorage.getItem(TOKEN_KEY)
  }
  return inMemoryToken
}

export const setAuthToken = (token: string | null): void => {
  inMemoryToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export class ApiError extends Error {
  code?: string
  status: number

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

let onAuthExpired: (() => void) | null = null

export const setAuthExpiredHandler = (handler: (() => void) | null): void => {
  onAuthExpired = handler
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

const performTokenRefresh = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const base = getApiBaseUrl()
      const res = await fetch(`${base}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!res.ok) {
        setAuthToken(null)
        onAuthExpired?.()
        return null
      }

      const data = (await res.json()) as { accessToken?: string }
      if (data.accessToken) {
        setAuthToken(data.accessToken)
        return data.accessToken
      }

      setAuthToken(null)
      onAuthExpired?.()
      return null
    } catch {
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const authorizedFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const headers = new Headers(init.headers || {})

  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAuthToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !url.includes('/auth/register')) {
    const newToken = await performTokenRefresh()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(url, {
        ...init,
        headers,
        credentials: 'include',
      })
    }
  }

  return response
}

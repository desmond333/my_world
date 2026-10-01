const TOKEN_KEY = 'tau-access-token'

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
        return null
      }

      const data = (await res.json()) as { accessToken?: string }
      if (data.accessToken) {
        setAuthToken(data.accessToken)
        return data.accessToken
      }

      setAuthToken(null)
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

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path}`
  const token = getAuthToken()

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh') && !path.includes('/auth/register')) {
    const newToken = await performTokenRefresh()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      if (!retryResponse.ok) {
        const errorData = (await retryResponse.json().catch(() => ({}))) as { error?: string; code?: string }
        throw new ApiError(errorData.error || `Request failed with status ${retryResponse.status}`, retryResponse.status, errorData.code)
      }

      return (await retryResponse.json()) as T
    }
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string; code?: string }
    throw new ApiError(errorData.error || `Request failed with status ${response.status}`, response.status, errorData.code)
  }

  return (await response.json()) as T
}

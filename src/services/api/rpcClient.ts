import { hc } from 'hono/client'
import type { AppType } from '../../../worker/src/index'
import { getApiBaseUrl, getAuthToken } from './apiClient'

export const createRpcClient = (originUrl?: string) => {
  const baseUrl = originUrl || getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '')
  return hc<AppType>(baseUrl, {
    headers: () => {
      const token = getAuthToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      return headers
    },
  })
}

export const rpc = createRpcClient()

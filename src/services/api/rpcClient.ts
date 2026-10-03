import { hc } from 'hono/client'
import type { AppType } from '../../../worker/src/index'
import { ApiError, authorizedFetch, getApiBaseUrl } from './apiClient'

export const createRpcClient = (originUrl?: string) => {
  const baseUrl = originUrl || getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '')
  return hc<AppType>(baseUrl, { fetch: authorizedFetch })
}

export const rpc = createRpcClient()

type ErrorResponse = {
  status: number
  json: () => Promise<unknown>
}

export const rpcError = async (res: ErrorResponse, fallback: string): Promise<never> => {
  const data = (await res.json().catch(() => null)) as { error?: string; code?: string } | null
  throw new ApiError(data?.error || fallback, res.status, data?.code)
}

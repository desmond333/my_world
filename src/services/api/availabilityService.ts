import { rpc, rpcError } from './rpcClient'
import type { AvailabilityWindow, AvailabilityWindowInput, FriendAvailability } from '../../data'

export const fetchAvailabilityWindowsApi = async (): Promise<AvailabilityWindow[]> => {
  const res = await rpc.api.availability.$get()
  if (!res.ok) return rpcError(res, 'Failed to fetch availability windows')
  const data = await res.json()
  return data.windows ?? []
}

export const fetchFriendsAvailabilityApi = async (): Promise<FriendAvailability[]> => {
  const res = await rpc.api.availability.friends.$get()
  if (!res.ok) return rpcError(res, 'Failed to fetch friends availability')
  const data = await res.json()
  return data.friends ?? []
}

export const createAvailabilityWindowApi = async (input: AvailabilityWindowInput): Promise<AvailabilityWindow> => {
  const res = await rpc.api.availability.$post({ json: input })
  if (!res.ok) return rpcError(res, 'Failed to create availability window')
  const data = await res.json()
  return data.window
}

export const updateAvailabilityWindowApi = async (id: string, input: Partial<AvailabilityWindowInput>): Promise<AvailabilityWindow> => {
  const res = await rpc.api.availability[':id'].$put({ param: { id }, json: input })
  if (!res.ok) return rpcError(res, 'Failed to update availability window')
  const data = await res.json()
  return data.window
}

export const deleteAvailabilityWindowApi = async (id: string): Promise<{ success: boolean }> => {
  const res = await rpc.api.availability[':id'].$delete({ param: { id } })
  if (!res.ok) return rpcError(res, 'Failed to delete availability window')
  return res.json()
}

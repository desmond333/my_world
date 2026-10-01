import { apiFetch } from './apiClient'
import type { AvailabilityWindow, AvailabilityWindowInput, FriendAvailability } from '../../data'

export const fetchAvailabilityWindowsApi = async (): Promise<AvailabilityWindow[]> => {
  const res = await apiFetch<{ windows: AvailabilityWindow[] }>('/api/availability')
  return res.windows ?? []
}

export const fetchFriendsAvailabilityApi = async (): Promise<FriendAvailability[]> => {
  const res = await apiFetch<{ friends: FriendAvailability[] }>('/api/availability/friends')
  return res.friends ?? []
}

export const createAvailabilityWindowApi = async (input: AvailabilityWindowInput): Promise<AvailabilityWindow> => {
  const res = await apiFetch<{ window: AvailabilityWindow }>('/api/availability', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.window
}

export const updateAvailabilityWindowApi = async (id: string, input: Partial<AvailabilityWindowInput>): Promise<AvailabilityWindow> => {
  const res = await apiFetch<{ window: AvailabilityWindow }>(`/api/availability/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return res.window
}

export const deleteAvailabilityWindowApi = async (id: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/api/availability/${id}`, {
    method: 'DELETE',
  })
}

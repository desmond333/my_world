import { apiFetch } from './apiClient'
import type { FriendsData, ProductivityItem, SentFriendTask, TaskPriority } from '../../data'

export type SearchUserResult = {
  id: string
  email: string
  relationship: 'friend' | 'incoming' | 'outgoing' | 'none'
  friendshipId?: string
}

export const fetchFriendsApi = async (): Promise<FriendsData> => {
  return apiFetch<FriendsData>('/api/friends')
}

export const searchUsersApi = async (query: string): Promise<SearchUserResult[]> => {
  const res = await apiFetch<{ results: SearchUserResult[] }>(`/api/friends/search?q=${encodeURIComponent(query)}`)
  return res.results
}

export const sendFriendRequestApi = async (target: string): Promise<{ success: boolean; status?: string; friendshipId?: string }> => {
  return apiFetch<{ success: boolean; status?: string; friendshipId?: string }>('/api/friends/request', {
    method: 'POST',
    body: JSON.stringify({ email: target }),
  })
}

export const acceptFriendRequestApi = async (id: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/api/friends/accept/${id}`, {
    method: 'POST',
  })
}

export const declineFriendRequestApi = async (id: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/api/friends/decline/${id}`, {
    method: 'POST',
  })
}

export const removeFriendApi = async (friendId: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/api/friends/${friendId}`, {
    method: 'DELETE',
  })
}

export const assignFriendTaskApi = async (params: {
  friendId: string
  title: string
  date?: string
  priority?: TaskPriority
  note?: string
}): Promise<{ success: boolean; task?: ProductivityItem }> => {
  return apiFetch<{ success: boolean; task?: ProductivityItem }>('/api/friends/tasks', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export const fetchSentFriendTasksApi = async (): Promise<SentFriendTask[]> => {
  const res = await apiFetch<{ tasks: SentFriendTask[] }>('/api/friends/tasks/sent')
  return res.tasks
}

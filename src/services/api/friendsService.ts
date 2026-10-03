import { rpc, rpcError } from './rpcClient'
import type { FriendsData, ProductivityItem, SentFriendTask, TaskPriority } from '../../data'

export type SearchUserResult = {
  id: string
  email: string
  relationship: 'friend' | 'incoming' | 'outgoing' | 'none'
  friendshipId?: string
}

export const fetchFriendsApi = async (): Promise<FriendsData> => {
  const res = await rpc.api.friends.$get()
  if (!res.ok) return rpcError(res, 'Failed to fetch friends')
  return res.json()
}

export const searchUsersApi = async (query: string): Promise<SearchUserResult[]> => {
  const res = await rpc.api.friends.search.$get({ query: { q: query } })
  if (!res.ok) return rpcError(res, 'Failed to search users')
  const data = await res.json()
  return data.results
}

export const sendFriendRequestApi = async (target: string): Promise<{ success: boolean; status?: string; friendshipId?: string }> => {
  const res = await rpc.api.friends.request.$post({ json: { email: target } })
  if (!res.ok) return rpcError(res, 'Failed to send friend request')
  return res.json()
}

export const acceptFriendRequestApi = async (id: string): Promise<{ success: boolean }> => {
  const res = await rpc.api.friends.accept[':id'].$post({ param: { id } })
  if (!res.ok) return rpcError(res, 'Failed to accept friend request')
  return res.json()
}

export const declineFriendRequestApi = async (id: string): Promise<{ success: boolean }> => {
  const res = await rpc.api.friends.decline[':id'].$post({ param: { id } })
  if (!res.ok) return rpcError(res, 'Failed to decline friend request')
  return res.json()
}

export const removeFriendApi = async (friendId: string): Promise<{ success: boolean }> => {
  const res = await rpc.api.friends[':friendId'].$delete({ param: { friendId } })
  if (!res.ok) return rpcError(res, 'Failed to remove friend')
  return res.json()
}

export const assignFriendTaskApi = async (params: {
  friendId: string
  title: string
  date?: string
  priority?: TaskPriority
  note?: string
}): Promise<{ success: boolean; task?: ProductivityItem }> => {
  const res = await rpc.api.friends.tasks.$post({ json: params })
  if (!res.ok) return rpcError(res, 'Failed to assign task')
  return res.json()
}

export const fetchSentFriendTasksApi = async (): Promise<SentFriendTask[]> => {
  const res = await rpc.api.friends.tasks.sent.$get()
  if (!res.ok) return rpcError(res, 'Failed to fetch sent tasks')
  const data = await res.json()
  return data.tasks
}

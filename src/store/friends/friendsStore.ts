import { create } from 'zustand'
import {
  acceptFriendRequestApi,
  assignFriendTaskApi,
  declineFriendRequestApi,
  fetchFriendsApi,
  fetchSentFriendTasksApi,
  removeFriendApi,
  sendFriendRequestApi,
} from '../../services/api/friendsService'
import type { FriendItem, FriendRequest, SentFriendTask, TaskPriority } from '../../data'
import { useAuthStore } from '../auth/authStore'

export type FriendsTab = 'friends' | 'search' | 'requests' | 'sent'

export type FriendsState = {
  friends: FriendItem[]
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
  sentTasks: SentFriendTask[]
  isLoading: boolean
  error: string | null
  isModalOpen: boolean
  activeTab: FriendsTab
  openModal: (tab?: FriendsTab) => void
  closeModal: () => void
  setActiveTab: (tab: FriendsTab) => void
  fetchFriends: () => Promise<void>
  fetchSentTasks: () => Promise<void>
  sendRequest: (emailOrId: string) => Promise<{ success: boolean; message?: string }>
  acceptRequest: (friendshipId: string) => Promise<boolean>
  declineRequest: (friendshipId: string) => Promise<boolean>
  removeFriend: (friendId: string) => Promise<boolean>
  assignTask: (params: {
    friendId: string
    title: string
    date?: string
    priority?: TaskPriority
    note?: string
  }) => Promise<{ success: boolean; message?: string }>
}

export const useFriendsStore = create<FriendsState>()((set, get) => ({
  friends: [],
  incoming: [],
  outgoing: [],
  sentTasks: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  activeTab: 'friends',

  openModal: (tab) => {
    set({ isModalOpen: true, ...(tab ? { activeTab: tab } : {}) })
    if (useAuthStore.getState().user) {
      void get().fetchFriends()
      void get().fetchSentTasks()
    }
  },

  closeModal: () => set({ isModalOpen: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchFriends: async () => {
    if (!useAuthStore.getState().user) return
    set({ isLoading: true, error: null })
    try {
      const data = await fetchFriendsApi()
      set({
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || [],
        isLoading: false,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch friends'
      set({ error: message, isLoading: false })
    }
  },

  fetchSentTasks: async () => {
    if (!useAuthStore.getState().user) return
    try {
      const tasks = await fetchSentFriendTasksApi()
      set({ sentTasks: tasks || [] })
    } catch {
      set({ sentTasks: [] })
    }
  },

  sendRequest: async (emailOrId: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await sendFriendRequestApi(emailOrId)
      await get().fetchFriends()
      set({ isLoading: false })
      return { success: res.success }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send request'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  acceptRequest: async (friendshipId: string) => {
    set({ isLoading: true, error: null })
    try {
      await acceptFriendRequestApi(friendshipId)
      await get().fetchFriends()
      set({ isLoading: false })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept request'
      set({ error: message, isLoading: false })
      return false
    }
  },

  declineRequest: async (friendshipId: string) => {
    set({ isLoading: true, error: null })
    try {
      await declineFriendRequestApi(friendshipId)
      await get().fetchFriends()
      set({ isLoading: false })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to decline request'
      set({ error: message, isLoading: false })
      return false
    }
  },

  removeFriend: async (friendId: string) => {
    set({ isLoading: true, error: null })
    try {
      await removeFriendApi(friendId)
      await get().fetchFriends()
      set({ isLoading: false })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove friend'
      set({ error: message, isLoading: false })
      return false
    }
  },

  assignTask: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await assignFriendTaskApi(params)
      await get().fetchSentTasks()
      set({ isLoading: false })
      return { success: res.success }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign task'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },
}))

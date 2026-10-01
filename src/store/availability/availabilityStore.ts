import { create } from 'zustand'
import {
  createAvailabilityWindowApi,
  deleteAvailabilityWindowApi,
  fetchAvailabilityWindowsApi,
  fetchFriendsAvailabilityApi,
  updateAvailabilityWindowApi,
} from '../../services/api/availabilityService'
import { getAuthToken } from '../../services/api/apiClient'
import type { AvailabilityWindow, AvailabilityWindowInput, FriendAvailability } from '../../data'

export type AvailabilityState = {
  windows: AvailabilityWindow[]
  friends: FriendAvailability[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchAll: () => Promise<void>
  createWindow: (input: AvailabilityWindowInput) => Promise<{ success: boolean; message?: string }>
  updateWindow: (id: string, input: Partial<AvailabilityWindowInput>) => Promise<{ success: boolean; message?: string }>
  deleteWindow: (id: string) => Promise<boolean>
  clearError: () => void
  reset: () => void
}

export const useAvailabilityStore = create<AvailabilityState>()((set, get) => ({
  windows: [],
  friends: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchAll: async () => {
    if (!getAuthToken()) return
    set({ isLoading: true, error: null })
    try {
      const windows = await fetchAvailabilityWindowsApi()
      const friends = await fetchFriendsAvailabilityApi().catch(() => [] as FriendAvailability[])
      set({ windows, friends, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch availability'
      set({ error: message, isLoading: false })
    }
  },

  createWindow: async (input) => {
    set({ isSaving: true, error: null })
    try {
      await createAvailabilityWindowApi(input)
      await get().fetchAll()
      set({ isSaving: false })
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save window'
      set({ error: message, isSaving: false })
      return { success: false, message }
    }
  },

  updateWindow: async (id, input) => {
    set({ isSaving: true, error: null })
    try {
      await updateAvailabilityWindowApi(id, input)
      await get().fetchAll()
      set({ isSaving: false })
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update window'
      set({ error: message, isSaving: false })
      return { success: false, message }
    }
  },

  deleteWindow: async (id) => {
    set({ isSaving: true, error: null })
    try {
      await deleteAvailabilityWindowApi(id)
      set((state) => ({ windows: state.windows.filter((item) => item.id !== id), isSaving: false }))
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete window'
      set({ error: message, isSaving: false })
      return false
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ windows: [], friends: [], isLoading: false, isSaving: false, error: null }),
}))

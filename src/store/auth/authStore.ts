import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch, getAuthToken, setAuthToken } from '../../services/api/apiClient'
import { pullSync, pushSync } from '../../services/api/syncService'

export type UserProfile = {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
}

export type AuthState = {
  user: UserProfile | null
  token: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  error: string | null
  lastSyncedAt: string | null
  isSyncing: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  syncData: (direction?: 'push' | 'pull') => Promise<boolean>
  clearError: () => void
}

const STORAGE_KEY = 'tau-auth-state'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      lastSyncedAt: null,
      isSyncing: false,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ status: 'loading', error: null })
        try {
          const res = await apiFetch<{
            user: UserProfile
            accessToken: string
          }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          })

          setAuthToken(res.accessToken)
          set({
            user: res.user,
            token: res.accessToken,
            status: 'authenticated',
            error: null,
          })

          void get().syncData('pull')
          return true
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ status: 'error', error: message })
          return false
        }
      },

      register: async (email, password) => {
        set({ status: 'loading', error: null })
        try {
          const res = await apiFetch<{
            user: UserProfile
            accessToken: string
          }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          })

          setAuthToken(res.accessToken)
          set({
            user: res.user,
            token: res.accessToken,
            status: 'authenticated',
            error: null,
          })

          void get().syncData('push')
          return true
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed'
          set({ status: 'error', error: message })
          return false
        }
      },

      logout: async () => {
        try {
          await apiFetch('/auth/logout', { method: 'POST' })
        } catch (e) {
          void e
        } finally {
          setAuthToken(null)
          set({
            user: null,
            token: null,
            status: 'unauthenticated',
            error: null,
          })
        }
      },

      checkAuth: async () => {
        const token = getAuthToken()
        if (!token && !get().user) {
          set({ status: 'unauthenticated' })
          return false
        }

        try {
          const user = await apiFetch<UserProfile>('/auth/me')
          set({
            user,
            token: getAuthToken(),
            status: 'authenticated',
            error: null,
          })
          return true
        } catch {
          setAuthToken(null)
          set({
            user: null,
            token: null,
            status: 'unauthenticated',
          })
          return false
        }
      },

      syncData: async (direction = 'push') => {
        if (!get().user) return false
        set({ isSyncing: true })
        try {
          if (direction === 'push') {
            await pushSync()
          } else {
            await pullSync()
          }
          const now = new Date().toISOString()
          set({ lastSyncedAt: now, isSyncing: false })
          return true
        } catch (err: unknown) {
          console.error(err)
          set({ isSyncing: false })
          return false
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        lastSyncedAt: state.lastSyncedAt,
      }),
    },
  ),
)

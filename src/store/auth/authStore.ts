import { create } from 'zustand'
import { STORAGE_KEYS } from '../../lib/storage'
import { persist } from 'zustand/middleware'
import { apiFetch, getAuthToken, setAuthToken } from '../../services/api/apiClient'
import { pullSync, pushSync } from '../../services/api/syncService'
import { useShopStore } from '../shop/shopStore'

export type UserProfile = {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
}

export type ReferralStats = {
  code: string
  invited: number
  earned: number
}

export type AuthState = {
  user: UserProfile | null
  token: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  error: string | null
  lastSyncedAt: string | null
  isSyncing: boolean
  referralStats: ReferralStats | null
  lastReferralReward: number
  referralStatus: 'none' | 'applied' | 'invalid'
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, referralCode?: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  syncData: (direction?: 'push' | 'pull') => Promise<boolean>
  fetchReferral: () => Promise<void>
  clearReferralReward: () => void
  clearError: () => void
}

const STORAGE_KEY = STORAGE_KEYS.authState

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      lastSyncedAt: null,
      isSyncing: false,
      referralStats: null,
      lastReferralReward: 0,
      referralStatus: 'none',

      clearError: () => set({ error: null }),

      clearReferralReward: () => set({ lastReferralReward: 0, referralStatus: 'none' }),

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

      register: async (email, password, referralCode) => {
        set({ status: 'loading', error: null })
        try {
          const res = await apiFetch<{
            user: UserProfile
            accessToken: string
            referralCode?: string | null
            referralReward?: number
            referralStatus?: 'none' | 'applied' | 'invalid'
          }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, referralCode: referralCode?.trim() || undefined }),
          })

          setAuthToken(res.accessToken)
          const reward = res.referralReward ?? 0
          if (reward > 0) {
            useShopStore.getState().addCoins(reward)
          }
          set({
            user: res.user,
            token: res.accessToken,
            status: 'authenticated',
            error: null,
            referralStats: res.referralCode ? { code: res.referralCode, invited: 0, earned: 0 } : null,
            lastReferralReward: reward,
            referralStatus: res.referralStatus ?? 'none',
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

      fetchReferral: async () => {
        if (!get().user) return
        try {
          const stats = await apiFetch<ReferralStats>('/auth/referral')
          set({ referralStats: stats })
        } catch {
          void 0
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

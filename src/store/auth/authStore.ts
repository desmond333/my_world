import { create } from 'zustand'
import { STORAGE_KEYS } from '../../lib/storage'
import { persist } from 'zustand/middleware'
import { ApiError, getAuthToken, setAuthExpiredHandler, setAuthToken } from '../../services/api/apiClient'
import { rpc, rpcError } from '../../services/api/rpcClient'
import { pullSync, pushSync } from '../../services/api/syncService'

export type UserProfile = {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
  premium?: boolean
}

export type PendingReferral = {
  id: string
  createdAt: string
}

export type ReferralStats = {
  code: string
  invited: number
  earned: number
  pending: PendingReferral[]
  premiumUntil: string | null
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
  claimReferralReward: (id: string, type: 'coins' | 'premium') => Promise<boolean>
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
          const res = await rpc.auth.login.$post({ json: { email, password } })
          if (!res.ok) throw await rpcError(res, 'Login failed')

          const data = await res.json()
          setAuthToken(data.accessToken)
          set({
            user: data.user,
            token: data.accessToken,
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
          const res = await rpc.auth.register.$post({
            json: { email, password, referralCode: referralCode?.trim() || undefined },
          })
          if (!res.ok) throw await rpcError(res, 'Registration failed')

          const data = await res.json()
          setAuthToken(data.accessToken)
          const reward = data.referralReward ?? 0
          set({
            user: data.user,
            token: data.accessToken,
            status: 'authenticated',
            error: null,
            referralStats: data.referralCode ? { code: data.referralCode, invited: 0, earned: 0, pending: [], premiumUntil: null } : null,
            lastReferralReward: reward,
            referralStatus: data.referralStatus ?? 'none',
          })

          void get()
            .syncData('push')
            .then(() => get().syncData('pull'))
          return true
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed'
          set({ status: 'error', error: message })
          return false
        }
      },

      logout: async () => {
        try {
          await rpc.auth.logout.$post()
        } catch (e) {
          void e
        } finally {
          setAuthToken(null)
          set({
            user: null,
            token: null,
            status: 'unauthenticated',
            error: null,
            referralStats: null,
            lastReferralReward: 0,
            referralStatus: 'none',
            lastSyncedAt: null,
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
          const res = await rpc.auth.me.$get()
          if (!res.ok) throw await rpcError(res, 'Failed to load profile')
          const data = await res.json()
          set({
            user: { id: data.id, email: data.email, role: data.role as 'user' | 'admin', createdAt: data.createdAt, premium: data.premium },
            token: getAuthToken(),
            status: 'authenticated',
            error: null,
          })
          return true
        } catch (err: unknown) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            setAuthToken(null)
            set({
              user: null,
              token: null,
              status: 'unauthenticated',
            })
            return false
          }

          set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to load profile' })
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
        } catch {
          set({ isSyncing: false })
          return false
        }
      },

      fetchReferral: async () => {
        if (!get().user) return
        try {
          const res = await rpc.auth.referral.$get()
          if (!res.ok) throw await rpcError(res, 'Failed to load referral stats')
          const stats = await res.json()
          set({ referralStats: stats })
        } catch {
          void 0
        }
      },

      claimReferralReward: async (id, type) => {
        if (!get().user) return false
        try {
          const res = await rpc.auth.referral.claim.$post({ json: { id, type } })
          if (!res.ok) throw await rpcError(res, 'Failed to claim referral reward')
          const data = await res.json()
          set({ referralStats: data.stats })
          void get().checkAuth()
          void get().syncData('pull')
          return true
        } catch {
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

setAuthExpiredHandler(() => {
  const { user, status } = useAuthStore.getState()
  if (!user && status !== 'authenticated') return
  useAuthStore.setState({
    user: null,
    token: null,
    status: 'unauthenticated',
    error: null,
    referralStats: null,
    lastReferralReward: 0,
    referralStatus: 'none',
  })
})

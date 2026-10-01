import { getAuthToken } from './apiClient'

type SyncTrigger = () => Promise<void>

let registeredTrigger: SyncTrigger | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

export const registerSyncTrigger = (trigger: SyncTrigger): void => {
  registeredTrigger = trigger
}

export const scheduleDebouncedSync = (delayMs = 2000): void => {
  if (typeof window === 'undefined' || !getAuthToken()) return

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null
    if (registeredTrigger) {
      void registeredTrigger().catch(() => {})
    }
  }, delayMs)
}

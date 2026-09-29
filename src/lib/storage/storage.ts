export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  getNumber(key: string, fallback = 0): number {
    if (typeof window === 'undefined') return fallback
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return fallback
      const parsed = parseInt(item, 10)
      return Number.isFinite(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  },

  setNumber(key: string, value: number): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.setItem(key, String(value))
      return true
    } catch {
      return false
    }
  },

  remove(key: string): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
}

import { createJSONStorage, type StateStorage } from 'zustand/middleware'

const DB_NAME = 'tau-db'
const STORE_NAME = 'keyval'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase | null> | null = null

const getIDB = (): Promise<IDBDatabase | null> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null)
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION)

        req.onupgradeneeded = () => {
          const db = req.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME)
          }
        }

        req.onsuccess = () => resolve(req.result)
        req.onerror = () => resolve(null)
        req.onblocked = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }

  return dbPromise
}

export const idbGet = async (key: string): Promise<string | null> => {
  const db = await getIDB()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => {
        const val = req.result
        resolve(typeof val === 'string' ? val : val !== undefined ? JSON.stringify(val) : null)
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export const idbSet = async (key: string, value: string): Promise<boolean> => {
  const db = await getIDB()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(value, key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
      tx.onabort = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export const idbDel = async (key: string): Promise<void> => {
  const db = await getIDB()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

export const idbEntries = async (): Promise<{ key: string; value: string }[]> => {
  const db = await getIDB()
  if (!db) return []

  return new Promise((resolve) => {
    const out: { key: string; value: string }[] = []
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const value = cursor.value
          out.push({ key: String(cursor.key), value: typeof value === 'string' ? value : JSON.stringify(value) })
          cursor.continue()
          return
        }
        resolve(out)
      }
      req.onerror = () => resolve(out)
    } catch {
      resolve(out)
    }
  })
}

export const idbClear = async (): Promise<void> => {
  const db = await getIDB()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

export const hybridStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    if (typeof window === 'undefined') return null

    try {
      const localVal = window.localStorage.getItem(name)
      if (localVal !== null) {
        return localVal
      }
    } catch (err) {
      void err
    }

    return idbGet(name).then((idbVal) => {
      if (idbVal !== null) {
        try {
          window.localStorage.setItem(name, idbVal)
        } catch (err) {
          void err
        }
        return idbVal
      }
      return null
    })
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return

    let localOk = true
    try {
      window.localStorage.setItem(name, value)
    } catch (err) {
      void err
      localOk = false
    }

    void idbSet(name, value).then((stored) => {
      if (localOk || !stored) return
      try {
        window.localStorage.removeItem(name)
      } catch {
        void 0
      }
    })
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(name)
    } catch (err) {
      void err
    }

    void idbDel(name)
  },
}

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null

    const idbVal = await idbGet(name)
    if (idbVal !== null) {
      try {
        window.localStorage.removeItem(name)
      } catch {
        void 0
      }
      return idbVal
    }

    try {
      const localVal = window.localStorage.getItem(name)
      if (localVal !== null) {
        await idbSet(name, localVal)
        try {
          window.localStorage.removeItem(name)
        } catch {
          void 0
        }
        return localVal
      }
    } catch {
      void 0
    }

    return null
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(name)
    } catch {
      void 0
    }
    await idbSet(name, value)
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(name)
    } catch {
      void 0
    }
    await idbDel(name)
  },
}

export const idbPersistStorage = createJSONStorage(() => idbStorage)

export const offlineStorage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const raw = await idbGet(key)
    if (raw) {
      try {
        return JSON.parse(raw) as T
      } catch {
        return fallback
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const localVal = window.localStorage.getItem(key)
        if (localVal) {
          return JSON.parse(localVal) as T
        }
      } catch {
        void 0
      }
    }

    return fallback
  },

  async set<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value)
    await idbSet(key, raw)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key)
      } catch {
        void 0
      }
    }
  },

  async remove(key: string): Promise<void> {
    await idbDel(key)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key)
      } catch {
        void 0
      }
    }
  },
}

export const hybridPersistStorage = createJSONStorage(() => hybridStorage)

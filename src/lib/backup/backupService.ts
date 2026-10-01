import { idbClear, idbEntries } from '../storage/hybridStorage'

export type StorageCategoryStat = {
  id: string
  nameRu: string
  nameEn: string
  bytes: number
  sizeFormatted: string
}

export type StorageStats = {
  totalBytes: number
  formattedSize: string
  itemsCount: number
  categories: StorageCategoryStat[]
}

export type BackupPayload = {
  version: number
  appName: string
  exportedAt: string
  keys: Record<string, string>
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const KNOWN_STORAGE_KEYS = [
  'animal-of-the-day',
  'animal-favorites',
  'animal-finance',
  'animal-productivity',
  'animal-training',
  'animal-subscriptions',
  'animal-birthdays',
  'animal-lottery',
  'animal-movies',
  'animal-books',
  'animal-games',
  'tau-shop-economy',
  'app-view-modes',
  'animal-notes',
  'tau_cat_hidden',
  'statham-lottery-trophies',
  'georgian-favorite-phrases',
]

export const getStorageStats = async (): Promise<StorageStats> => {
  if (typeof window === 'undefined') {
    return {
      totalBytes: 0,
      formattedSize: '0 B',
      itemsCount: 0,
      categories: [],
    }
  }

  let totalBytes = 0
  let itemsCount = 0

  const categoryMap: Record<string, { nameRu: string; nameEn: string; bytes: number; keys: string[] }> = {
    notes: {
      nameRu: 'Заметки и сны',
      nameEn: 'Notes & Dreams',
      bytes: 0,
      keys: ['animal-notes'],
    },
    productivity: {
      nameRu: 'Продуктивность',
      nameEn: 'Productivity & Tasks',
      bytes: 0,
      keys: ['animal-productivity'],
    },
    finance: {
      nameRu: 'Финансы',
      nameEn: 'Finance & Budget',
      bytes: 0,
      keys: ['animal-finance'],
    },
    media: {
      nameRu: 'Медиа-коллекции',
      nameEn: 'Media Collections',
      bytes: 0,
      keys: ['animal-movies', 'animal-books', 'animal-games'],
    },
    shop: {
      nameRu: 'Магазин и казна',
      nameEn: 'Shop & Treasury',
      bytes: 0,
      keys: ['tau-shop-economy', 'statham-lottery-trophies'],
    },
    training: {
      nameRu: 'Тренировки',
      nameEn: 'Workouts',
      bytes: 0,
      keys: ['animal-training'],
    },
    settings: {
      nameRu: 'Настройки и вид',
      nameEn: 'Settings & Views',
      bytes: 0,
      keys: [
        'animal-of-the-day',
        'app-view-modes',
        'animal-favorites',
        'animal-subscriptions',
        'animal-birthdays',
        'animal-lottery',
        'tau_cat_hidden',
        'georgian-favorite-phrases',
      ],
    },
  }

  const entries = new Map<string, string>()

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key) continue
      entries.set(key, window.localStorage.getItem(key) ?? '')
    }
  } catch {
    void 0
  }

  try {
    for (const entry of await idbEntries()) {
      entries.set(entry.key, entry.value)
    }
  } catch {
    void 0
  }

  for (const [key, val] of entries) {
    const itemBytes = (key.length + val.length) * 2
    totalBytes += itemBytes
    itemsCount++

    let matched = false
    for (const cat of Object.values(categoryMap)) {
      if (cat.keys.includes(key)) {
        cat.bytes += itemBytes
        matched = true
        break
      }
    }
    if (!matched) {
      categoryMap.settings.bytes += itemBytes
    }
  }

  const categories: StorageCategoryStat[] = Object.entries(categoryMap).map(([id, cat]) => ({
    id,
    nameRu: cat.nameRu,
    nameEn: cat.nameEn,
    bytes: cat.bytes,
    sizeFormatted: formatBytes(cat.bytes),
  }))

  return {
    totalBytes,
    formattedSize: formatBytes(totalBytes),
    itemsCount,
    categories,
  }
}

export const createBackupPayload = (): BackupPayload => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      version: 1,
      appName: 'TAU',
      exportedAt: new Date().toISOString(),
      keys: {},
    }
  }

  const data: Record<string, string> = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if (KNOWN_STORAGE_KEYS.includes(key) || key.startsWith('animal-') || key.startsWith('tau') || key.startsWith('app-')) {
      data[key] = window.localStorage.getItem(key) ?? ''
    }
  }

  return {
    version: 1,
    appName: 'TAU',
    exportedAt: new Date().toISOString(),
    keys: data,
  }
}

export const downloadBackupFile = () => {
  const payload = createBackupPayload()
  const jsonStr = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const dateStr = new Date().toISOString().slice(0, 10)
  const link = document.createElement('a')
  link.href = url
  link.download = `tau-backup-${dateStr}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const restoreBackupFromJSON = (rawJson: string): { success: boolean; count: number; error?: string } => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, count: 0, error: 'localStorage is not available' }
  }

  try {
    const parsed = JSON.parse(rawJson) as Partial<BackupPayload>
    if (!parsed || typeof parsed !== 'object' || !parsed.keys || typeof parsed.keys !== 'object') {
      return { success: false, count: 0, error: 'Invalid backup format' }
    }

    let count = 0
    for (const [key, val] of Object.entries(parsed.keys)) {
      if (typeof key === 'string' && typeof val === 'string') {
        window.localStorage.setItem(key, val)
        count++
      }
    }

    return { success: true, count }
  } catch (e) {
    return {
      success: false,
      count: 0,
      error: e instanceof Error ? e.message : 'Unknown parsing error',
    }
  }
}

export const clearTemporaryCache = (): { freedBytes: number; clearedKeys: number } => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { freedBytes: 0, clearedKeys: 0 }
  }

  let freedBytes = 0
  let clearedKeys = 0
  const keysToRemove: string[] = []

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if (key.includes('cache') || key.includes('temp') || key.startsWith('tmdb-cache') || key.startsWith('wiki-cache')) {
      keysToRemove.push(key)
    }
  }

  for (const k of keysToRemove) {
    const val = window.localStorage.getItem(k) ?? ''
    freedBytes += (k.length + val.length) * 2
    window.localStorage.removeItem(k)
    clearedKeys++
  }

  return { freedBytes, clearedKeys }
}

export const resetAllData = async () => {
  if (typeof window === 'undefined') return

  try {
    await idbClear()
  } catch {
    void 0
  }

  if (!window.localStorage) return

  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key) keysToRemove.push(key)
  }

  for (const k of keysToRemove) {
    window.localStorage.removeItem(k)
  }
}

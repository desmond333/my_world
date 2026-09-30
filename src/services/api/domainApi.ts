import { apiFetch } from './apiClient'
import type {
  AnimalScope,
  Birthday,
  Blocks,
  CollectionItem,
  CollectionListKey,
  CurrencyRates,
  Favorite,
  FinanceEntry,
  MonthPoints,
  ProductivityItem,
  ProductivityKind,
  RepeatInterval,
  Subscription,
  TaskPriority,
  ThemeMode,
  TrainingSport,
} from '../../data'
import type { SyncSnapshot } from '../../store/types'
import type { Note, NoteKind } from '../../store/notes/notesStore'
import type { LotteryStats } from '../../store/lottery/lotteryStore'
import type { CatSkinId, ShopItemKey, ThemeSkinId } from '../../store/shop/shopStore'
import type { ViewMode, ViewPageId } from '../../store/viewMode/viewModeStore'

export type AuthUser = {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type SettingsResponse = {
  lang: string
  themeMode: ThemeMode
  cityId: string
  scope: AnimalScope
  extraTab: boolean
  startPage: string
  blocks: Blocks
}

export type ShopResponse = {
  coins: number
  unlockedParts: Partial<Record<ShopItemKey, boolean>>
  activeCatSkin: CatSkinId
  activeThemeSkin: ThemeSkinId
  greetingSent: boolean
  greetingFriendName: string
  greetingTimestamp: number | null
  greetingRewardClaimed: boolean
  hasPendingGreetingReply: boolean
}

export type ViewModesResponse = {
  globalMode: ViewMode
  pageModes: Partial<Record<ViewPageId, ViewMode>>
  avatarMode: ViewMode
}

export type AdminUserItem = {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export const authApi = {
  register: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  refresh: () =>
    apiFetch<{ accessToken?: string; user?: AuthUser }>('/auth/refresh', {
      method: 'POST',
    }),

  logout: () =>
    apiFetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => apiFetch<{ user: AuthUser }>('/auth/me'),
}

export const settingsApi = {
  get: () => apiFetch<SettingsResponse>('/api/settings'),
  update: (body: Partial<SettingsResponse>) =>
    apiFetch<SettingsResponse>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}

export const trainingApi = {
  getDays: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<Record<string, string[]>>(`/api/training/days${query}`)
  },

  setDay: (date: string, sports: string[]) =>
    apiFetch<{ success: boolean; date: string; sports: string[] }>(`/api/training/days/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ sports }),
    }),

  deleteDay: (date: string) =>
    apiFetch<{ success: boolean }>(`/api/training/days/${date}`, {
      method: 'DELETE',
    }),

  getSports: () => apiFetch<TrainingSport[]>('/api/training/sports'),

  createSport: (sport: Omit<TrainingSport, 'id'>) =>
    apiFetch<TrainingSport>('/api/training/sports', {
      method: 'POST',
      body: JSON.stringify(sport),
    }),

  updateSport: (id: string, patch: Partial<TrainingSport>) =>
    apiFetch<{ success: boolean }>(`/api/training/sports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteSport: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/training/sports/${id}`, {
      method: 'DELETE',
    }),
}

export const financeApi = {
  getEntries: (month?: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', month)
    if (limit) params.set('limit', String(limit))
    if (offset) params.set('offset', String(offset))
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<FinanceEntry[]>(`/api/finance/entries${query}`)
  },

  createEntry: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>) =>
    apiFetch<FinanceEntry>('/api/finance/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  updateEntry: (id: string, patch: Partial<FinanceEntry>) =>
    apiFetch<{ success: boolean }>(`/api/finance/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteEntry: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/finance/entries/${id}`, {
      method: 'DELETE',
    }),

  getBalance: () => apiFetch<CurrencyRates>('/api/finance/balance'),

  updateBalance: (balance: Partial<CurrencyRates>) =>
    apiFetch<CurrencyRates>('/api/finance/balance', {
      method: 'PUT',
      body: JSON.stringify(balance),
    }),

  getRates: () => apiFetch<{ rates: CurrencyRates; source: string; updated_at?: string }>('/api/finance/rates'),

  updateRates: (rates: Partial<CurrencyRates>, source = 'manual') =>
    apiFetch<{ rates: CurrencyRates; source: string }>('/api/finance/rates', {
      method: 'PUT',
      body: JSON.stringify({ rates, source }),
    }),
}

export const productivityApi = {
  getItems: (params?: { kind?: ProductivityKind; done?: boolean; limit?: number; offset?: number }) => {
    const search = new URLSearchParams()
    if (params?.kind) search.set('kind', params.kind)
    if (params?.done !== undefined) search.set('done', String(params.done))
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))
    const query = search.toString() ? `?${search.toString()}` : ''
    return apiFetch<ProductivityItem[]>(`/api/productivity${query}`)
  },

  createItem: (item: {
    kind: ProductivityKind
    title: string
    date?: string
    done?: boolean
    repeat?: RepeatInterval
    priority?: TaskPriority
    note?: string
  }) =>
    apiFetch<ProductivityItem>('/api/productivity', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (id: string, patch: Partial<ProductivityItem>) =>
    apiFetch<{ success: boolean }>(`/api/productivity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteItem: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/productivity/${id}`, {
      method: 'DELETE',
    }),

  getMonths: () => apiFetch<{ months: Record<string, MonthPoints> }>('/api/productivity/months'),

  updateMonths: (months: Record<string, MonthPoints>) =>
    apiFetch<{ success: boolean }>('/api/productivity/months', {
      method: 'PUT',
      body: JSON.stringify({ months }),
    }),

  getMood: () => apiFetch<Record<string, { level: number; note?: string }>>('/api/productivity/mood'),

  setMood: (date: string, level: number, note?: string) =>
    apiFetch<{ success: boolean; date: string; level: number; note: string }>(`/api/productivity/mood/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ level, note }),
    }),

  deleteMood: (date: string) =>
    apiFetch<{ success: boolean }>(`/api/productivity/mood/${date}`, {
      method: 'DELETE',
    }),
}

export const subscriptionsApi = {
  getAll: () => apiFetch<Subscription[]>('/api/subscriptions'),

  create: (sub: Omit<Subscription, 'id'>) =>
    apiFetch<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(sub),
    }),

  update: (id: string, patch: Partial<Subscription>) =>
    apiFetch<{ success: boolean }>(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    }),
}

export const birthdaysApi = {
  getAll: () => apiFetch<{ ownBirthday: string; birthdays: Birthday[] }>('/api/birthdays'),

  create: (name: string, date: string) =>
    apiFetch<Birthday>('/api/birthdays', {
      method: 'POST',
      body: JSON.stringify({ name, date }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/birthdays/${id}`, {
      method: 'DELETE',
    }),

  setOwnBirthday: (date: string) =>
    apiFetch<{ ownBirthday: string }>('/api/birthdays/own', {
      method: 'PUT',
      body: JSON.stringify({ date }),
    }),
}

export const collectionApi = {
  getItems: (collection: 'movies' | 'books' | 'games', list?: CollectionListKey) => {
    const query = list ? `?list=${list}` : ''
    return apiFetch<CollectionItem[]>(`/api/collection/${collection}${query}`)
  },

  createItem: (collection: 'movies' | 'books' | 'games', listKey: CollectionListKey, item: CollectionItem) =>
    apiFetch<CollectionItem>(`/api/collection/${collection}`, {
      method: 'POST',
      body: JSON.stringify({ listKey, item }),
    }),

  updateItem: (collection: 'movies' | 'books' | 'games', id: string, listKey?: CollectionListKey, patch?: Partial<CollectionItem>) =>
    apiFetch<{ success: boolean }>(`/api/collection/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ listKey, patch }),
    }),

  deleteItem: (collection: 'movies' | 'books' | 'games', id: string, list?: CollectionListKey) => {
    const query = list ? `?list=${list}` : ''
    return apiFetch<{ success: boolean }>(`/api/collection/${collection}/${id}${query}`, {
      method: 'DELETE',
    })
  },

  reorder: (collection: 'movies' | 'books' | 'games', list: CollectionListKey, orderedIds: string[]) =>
    apiFetch<{ success: boolean }>(`/api/collection/${collection}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ list, orderedIds }),
    }),
}

export const favoritesApi = {
  getAll: () => apiFetch<Favorite[]>('/api/favorites'),

  add: (item: Favorite) =>
    apiFetch<Favorite>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  remove: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/favorites/${id}`, {
      method: 'DELETE',
    }),
}

export const lotteryApi = {
  getStats: () => apiFetch<LotteryStats>('/api/lottery/stats'),

  updateStats: (stats: LotteryStats) =>
    apiFetch<{ success: boolean }>('/api/lottery/stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    }),

  recordSpin: (sectorId: string, won: boolean, prize: number) =>
    apiFetch<LotteryStats>('/api/lottery/record', {
      method: 'POST',
      body: JSON.stringify({ sectorId, won, prize }),
    }),
}

export const notesApi = {
  getAll: (kind?: NoteKind, limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (kind) params.set('kind', kind)
    if (limit) params.set('limit', String(limit))
    if (offset) params.set('offset', String(offset))
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<Note[]>(`/api/notes${query}`)
  },

  create: (item: { kind?: NoteKind; title?: string; body?: string }) =>
    apiFetch<Note>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  update: (id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) =>
    apiFetch<{ success: boolean }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/notes/${id}`, {
      method: 'DELETE',
    }),
}

export const shopApi = {
  getState: () => apiFetch<ShopResponse>('/api/shop'),

  updateState: (patch: Partial<ShopResponse>) =>
    apiFetch<ShopResponse>('/api/shop', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
}

export const viewModesApi = {
  getModes: () => apiFetch<ViewModesResponse>('/api/view-modes'),

  updateModes: (patch: Partial<ViewModesResponse>) =>
    apiFetch<ViewModesResponse>('/api/view-modes', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
}

export const syncApi = {
  getSnapshot: () => apiFetch<SyncSnapshot>('/api/sync'),

  pushSnapshot: (snapshot: SyncSnapshot) =>
    apiFetch<{ success: boolean; updated_at?: string }>('/api/sync', {
      method: 'POST',
      body: JSON.stringify(snapshot),
    }),
}

export const adminApi = {
  getUsers: () => apiFetch<{ users: AdminUserItem[] }>('/admin/users'),

  getUserData: (userId: string) => apiFetch<{ data: SyncSnapshot }>(`/admin/users/${userId}/data`),

  deleteUser: (userId: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
}

export const tmdbApi = {
  searchMovies: (query: string, page = 1) =>
    apiFetch<{ results: unknown[]; total_pages: number; total_results: number }>(
      `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    ),

  getGenres: () => apiFetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),

  getMovieDetails: (id: number | string) => apiFetch<unknown>(`/movie/${id}`),
}

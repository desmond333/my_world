import type {
  Animal,
  BlockKey,
  Blocks,
  City,
  CollectionItem,
  CollectionListKey,
  CurrencyRates,
  FinanceEntry,
  MonthPoints,
  ProductivityItem,
  Subscription,
} from '../data'
import type { AnimalScope, Birthday, Favorite, ThemeMode, TrainingSport } from '../data/types'
import type { MoodEntry } from './productivity/productivityStore'
import type { Note } from './notes/notesStore'
import type { LotteryStats } from './lottery/lotteryStore'
import type { CatSkinId, ShopItemKey, ThemeSkinId } from './shop/shopStore'
import type { ViewMode, ViewPageId } from './viewMode/viewModeStore'

export type DailyState = {
  date: string
  animalIndex: number
  recent: number[]
  cityId: string
  scope: AnimalScope
  themeMode: ThemeMode
  lang: 'ru' | 'en'
  blocks: Blocks
  extraTab: boolean
  startPage: string
  allowFriendTasks: boolean
  chooseForToday: (date: string, scope: AnimalScope) => void
  setStartPage: (path: string) => void
  setCity: (city: City) => void
  setScope: (scope: AnimalScope) => void
  setThemeMode: (mode: ThemeMode) => void
  setLang: (lang: 'ru' | 'en') => void
  toggleLang: () => void
  toggleBlock: (key: BlockKey) => void
  toggleExtraTab: () => void
  setAllowFriendTasks: (allow: boolean) => void
}

export type TrainingState = {
  days: Record<string, string[]>
  sports: TrainingSport[]
  setDay: (date: string, kinds: string[]) => void
  toggleSport: (date: string, sportId: string) => void
  setSportEnabled: (id: string, enabled: boolean) => void
  addSport: (label: string, color: string) => void
  removeSport: (id: string) => void
  resetTraining: () => void
}

export type BirthdayState = {
  ownBirthday: string
  birthdays: Birthday[]
  setOwnBirthday: (date: string) => void
  addBirthday: (name: string, date: string) => void
  removeBirthday: (id: string) => void
}

export type FavoritesState = {
  favorites: Favorite[]
  isFavorite: (id: string) => boolean
  addFavorite: (animal: Animal) => void
  removeFavorite: (id: string) => void
}

export type CollectionState = {
  wishlist: CollectionItem[]
  watched: CollectionItem[]
  isIn: (list: CollectionListKey, id: string) => boolean
  add: (list: CollectionListKey, item: CollectionItem) => void
  remove: (list: CollectionListKey, id: string) => void
  move: (id: string, to: CollectionListKey) => void
  reorder: (list: CollectionListKey, orderedIds: string[]) => void
  updateItem: (list: CollectionListKey, id: string, patch: Partial<CollectionItem>) => void
}

export type SyncSnapshot = {
  settings: {
    lang: string
    themeMode: ThemeMode
    cityId: string
    scope: AnimalScope
    extraTab: boolean
    startPage: string
    blocks: Blocks
    allowFriendTasks: boolean
  }
  training: {
    days: Record<string, string[]>
    sports: TrainingSport[]
  }
  finance: {
    entries: FinanceEntry[]
    balance: CurrencyRates
    rates: CurrencyRates
    ratesSource: string
  }
  productivity: {
    items: ProductivityItem[]
    months: Record<string, MonthPoints>
    mood: Record<string, MoodEntry>
  }
  subscriptions: {
    items: Subscription[]
  }
  birthdays: {
    ownBirthday: string
    birthdays: Birthday[]
  }
  collection: {
    movies: { wishlist: CollectionItem[]; watched: CollectionItem[] }
    books: { wishlist: CollectionItem[]; watched: CollectionItem[] }
    games: { wishlist: CollectionItem[]; watched: CollectionItem[] }
  }
  favorites: Favorite[]
  lottery: LotteryStats
  notes: Note[]
  shop: {
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
  viewModes: {
    globalMode: ViewMode
    pageModes: Partial<Record<ViewPageId, ViewMode>>
    avatarMode: ViewMode
  }
}

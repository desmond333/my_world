import type {
  Animal,
  AnimalScope,
  Birthday,
  BlockKey,
  Blocks,
  City,
  CollectionItem,
  CollectionListKey,
  Favorite,
  SyncSnapshot,
  ThemeMode,
  ThemePaletteId,
  TrainingSport,
} from '../data'

export type { SyncSnapshot }

export type DailyState = {
  date: string
  animalIndex: number
  recent: number[]
  cityId: string
  scope: AnimalScope
  themeMode: ThemeMode
  themePalette: ThemePaletteId
  lang: 'ru' | 'en'
  blocks: Blocks
  extraTab: boolean
  startPage: string
  allowFriendTasks: boolean
  hiddenSections?: string[]
  chooseForToday: (date: string, scope: AnimalScope) => void
  setStartPage: (path: string) => void
  setCity: (city: City) => void
  setScope: (scope: AnimalScope) => void
  setThemeMode: (mode: ThemeMode) => void
  setThemePalette: (palette: ThemePaletteId) => void
  setLang: (lang: 'ru' | 'en') => void
  toggleLang: () => void
  toggleBlock: (key: BlockKey) => void
  toggleExtraTab: () => void
  setAllowFriendTasks: (allow: boolean) => void
  hideSection: (key: string) => void
  showSection: (key: string) => void
  toggleSection: (key: string) => void
  resetHiddenSections: () => void
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

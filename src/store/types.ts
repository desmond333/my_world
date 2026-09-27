import type { Animal, BlockKey, Blocks, City } from '../data'
import type { AnimalScope, Birthday, Favorite, ThemeMode } from '../data/types'

export type DailyState = {
  date: string
  animalIndex: number
  recent: number[]
  cityId: string
  scope: AnimalScope
  themeMode: ThemeMode
  blocks: Blocks
  chooseForToday: (date: string, scope: AnimalScope) => void
  setCity: (city: City) => void
  setScope: (scope: AnimalScope) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleBlock: (key: BlockKey) => void
}

export type TrainingState = {
  days: Record<string, string>
  setDay: (date: string, done: boolean) => void
  toggleDay: (date: string) => void
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

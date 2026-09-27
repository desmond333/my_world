import type { Animal, AnimalScope, BlockKey, Blocks, City, ThemeMode } from '../../data'
import type { DayForecast, Weather } from '../../services'
import type { Holiday } from '../../services/holidays'

export type Occasion = { title: string; isThemed: boolean }

export { type Holiday }

export type TopbarProps = {
  city: City
  now: Date
  trainingCount: number
  favoritesCount: number
  settingsOpen: boolean
  onToggleSettings: () => void
}

export type SettingsPanelProps = {
  city: City
  scope: AnimalScope
  themeMode: ThemeMode
  blocks: Blocks
  season: string
  onClose: () => void
  onCity: (city: City) => void
  onScope: (scope: AnimalScope) => void
  onTheme: (mode: ThemeMode) => void
  onToggleBlock: (key: BlockKey) => void
  onOpenBirthday: () => void
}

export type HeroSectionProps = {
  animal: Animal
  isFavorite: boolean
  onToggleFavorite: () => void
}

export type BreedCardProps = { animal: Animal }

export type TodayCardProps = {
  now: Date
  timezone: string
  zone: string
  season: string
}

export type WeatherCardProps = {
  cityName: string
  weather: Weather | null
  forecast: DayForecast[]
  failed: boolean
  open: boolean
  onToggle: () => void
}

export type ForecastStripProps = { forecast: DayForecast[] }

export type TrainingCardProps = {
  trainedToday: boolean
  copied: boolean
  copyFailed: boolean
  onToggle: () => void
  onCopy: () => void
}

export type WishCardProps = { wish: string }

export type OccasionCardProps = {
  holiday: Holiday | null
  loading: boolean
  occasion: Occasion
  cityName: string
}

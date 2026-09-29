export type Animal = {
  id: string
  species: string
  name: string
  breed: string
  image: string
  alt: string
  description: string
  phrase: string
  facts: string
  weight: string
  lifespan: string
  habitat: string
  wikiUrl: string
  category: 'home' | 'wild'
}

export type City = {
  id: string
  name: string
  timezone: string
  latitude: number
  longitude: number
  zone: string
}

export type AnimalSeed = Omit<Animal, 'wikiUrl'> & { wikipedia: string }

export type AnimalFacts = Pick<Animal, 'image' | 'description' | 'wikiUrl'>

export type BlockKey = 'animal' | 'today' | 'weather' | 'wish' | 'occasion' | 'training'
export type Blocks = Record<BlockKey, boolean>

export type AnimalScope = 'all' | 'home'
export type ThemeMode = 'system' | 'dark' | 'light'

export type TrainingSport = {
  id: string
  label: string
  color: string
  enabled: boolean
  custom: boolean
}

export type Birthday = { id: string; name: string; date: string }

export type Favorite = { id: string; name: string; breed: string; image: string; addedAt: string }

export type CollectionListKey = 'wishlist' | 'watched'

export type CollectionListOption = { key: CollectionListKey; label: string; hint: string }

export type SearchCandidate = {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string | null
  year: number | null
  tags: string[]
  score: string | null
}

export type CollectionItem = SearchCandidate & {
  addedAt: string
  review?: string
  enjoyment?: number
  enjoymentReaction?: 'fire' | 'love' | 'good' | 'meh' | 'bad'
}

export type PeriodOption = { id: string; label: string; from: number | null; to: number | null }

export type CollectionDetailFact = { label: string; value: string }

export type CollectionDetails = {
  tagline: string
  facts: CollectionDetailFact[]
  overview: string
  links: { label: string; href: string }[]
}

export type ProductivityKind = 'task' | 'goal' | 'dream'

export type RepeatInterval = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'

export type ProductivityItem = {
  id: string
  kind: ProductivityKind
  title: string
  date: string
  repeat?: RepeatInterval
  done: boolean
  createdAt: string
  doneAt: string | null
}

export type KindCounts = Record<ProductivityKind, number>

export type MonthPoints = { points: number; counts: KindCounts }

export type Currency = 'RUB' | 'USD' | 'GEL'

export type CurrencyRates = Record<Currency, number>

export type FinanceKind = 'salary' | 'oneoff'

export type FinanceEntry = {
  id: string
  month: string
  kind: FinanceKind
  amount: number
  currency: Currency
  note: string
  createdAt: string
}

export type SubscriptionPeriod = 'week' | 'month' | 'year'

export type Subscription = {
  id: string
  name: string
  price: number
  currency: Currency
  period: SubscriptionPeriod
  startedAt: string
  until: string
  note: string
}

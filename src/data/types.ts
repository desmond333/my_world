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
  country: 'ru' | 'world'
  timezone: string
  latitude: number
  longitude: number
  zone: string
}

export type AnimalSeed = Omit<Animal, 'wikiUrl'> & { wikipedia: string }

export type AnimalFacts = Pick<Animal, 'description' | 'wikiUrl'>

export type BlockKey = 'animal' | 'today' | 'weather' | 'wish' | 'occasion' | 'training'
export type Blocks = Record<BlockKey, boolean>

export type AnimalScope = 'all' | 'home'
export type ThemeMode = 'system' | 'dark' | 'light'
export type SeasonalThemeId = 'spring' | 'summer' | 'autumn' | 'winter'
export type NamedThemeId = 'nord' | 'solarized' | 'graphite'
export type ThemePaletteId = NamedThemeId

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
  finishedAt?: string
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

export type TaskPriority = 'high' | 'medium' | 'low'

export type ProductivityItem = {
  id: string
  kind: ProductivityKind
  title: string
  date: string
  repeat?: RepeatInterval
  done: boolean
  createdAt: string
  doneAt: string | null
  priority?: TaskPriority
  note?: string
  senderId?: string
  senderName?: string
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

export type Deposit = {
  id: string
  title: string
  bank: string
  amount: number
  currency: Currency
  rate: number
  startDate: string
  periodMonths: number
  isCapitalized: boolean
  canDeposit?: boolean
  canWithdraw?: boolean
  note?: string
  createdAt: string
}

export type Loan = {
  id: string
  title: string
  bank: string
  initialAmount: number
  remainingAmount: number
  currency: Currency
  rate: number
  monthlyPayment: number
  paymentDay: number
  startDate: string
  endDate: string
  note?: string
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

export type FriendItem = {
  id: string
  friendshipId: string
  email: string
  allowFriendTasks: boolean
  createdAt: string
}

export type FriendRequest = {
  id: string
  friendshipId: string
  email: string
  createdAt: string
}

export type FriendsData = {
  friends: FriendItem[]
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
}

export type SentFriendTask = {
  id: string
  recipientId: string
  recipientEmail: string
  title: string
  date: string
  done: boolean
  doneAt: string | null
  priority?: TaskPriority
  note?: string
  createdAt: string
}

export type AvailabilityScope = 'weekly' | 'date'

export const MINUTES_IN_DAY = 1440

export type AvailabilityWindow = {
  id: string
  userId: string
  scope: AvailabilityScope
  dayOfWeek: number | null
  date: string | null
  startMin: number
  endMin: number
  note: string
  createdAt: string
  updatedAt: string
}

export type FriendAvailability = {
  friendId: string
  email: string
  windows: AvailabilityWindow[]
}

export type AvailabilityWindowInput = {
  scope?: AvailabilityScope
  dayOfWeek?: number | null
  date?: string | null
  startMin: number
  endMin: number
  note?: string
}

export type NoteKind = 'note' | 'dream'

export type Note = {
  id: string
  kind: NoteKind
  title: string
  body: string
  parentId?: string | null
  icon?: string | null
  createdAt: string
  updatedAt: string
}

export type MoodEntry = { level: number; note?: string }

export type LotteryStats = Record<string, { spins: number; wins: number; earned: number }>

import type { CatSkinId, ShopItemKey, ThemeSkinId } from '../lib/shop/catalog'

export type { CatSkinId, ShopItemKey, ThemeSkinId }

export type ViewMode = 'simple' | 'normal'

export type CornerStyle = 'round' | 'middle' | 'square'

export type ViewPageId =
  'today' | 'productivity' | 'finance' | 'training' | 'media' | 'mind' | 'languages' | 'favorites' | 'notes' | 'tasks' | 'goals' | 'dreams'

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
    hiddenSections?: string[]
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
    cornerStyle: CornerStyle
  }
  availability: {
    windows: AvailabilityWindow[]
  }
}

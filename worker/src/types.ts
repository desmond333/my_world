export interface Env {
  DB: D1Database
  TMDB_TOKEN?: string
  ALLOWED_ORIGIN?: string
  FRONTEND_ORIGIN?: string
  ADMIN_EMAIL?: string
  JWT_SECRET?: string
  ENVIRONMENT?: string
}

export type UserRole = 'user' | 'admin'

export type UserToken = {
  userId: string
  role: UserRole
}

declare module 'hono' {
  interface ContextVariableMap {
    user: UserToken
  }
}

export type Favorite = {
  id: string
  name: string
  breed: string
  image: string
  addedAt: string
}

export type Birthday = {
  id: string
  name: string
  date: string
}

export type TrainingSport = {
  id: string
  label: string
  color: string
  enabled: boolean
  custom: boolean
  sortOrder?: number
}

export type FinanceKind = 'salary' | 'oneoff'
export type Currency = 'RUB' | 'USD' | 'GEL'

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

export type ProductivityMonthRecord = {
  points: number
  counts: Record<ProductivityKind, number>
}

export type MoodEntry = {
  level: number
  note?: string
}

export type CollectionListKey = 'wishlist' | 'watched'

export type CollectionItem = {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string | null
  year: number | null
  tags: string[]
  score: string | null
  addedAt: string
  finishedAt?: string
  review?: string
  enjoyment?: number
  enjoymentReaction?: 'fire' | 'love' | 'good' | 'meh' | 'bad'
  sortOrder?: number
}

export type ThemeMode = 'system' | 'dark' | 'light'
export type AnimalScope = 'all' | 'home'
export type BlockKey = 'animal' | 'today' | 'weather' | 'wish' | 'occasion' | 'training'
export type Blocks = Record<BlockKey, boolean>

export type SettingsData = {
  lang: string
  themeMode: ThemeMode
  cityId: string
  scope: AnimalScope
  extraTab: boolean
  startPage: string
  blocks: Blocks
  allowFriendTasks: boolean
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

export const MINUTES_IN_DAY = 24 * 60

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

export type LotteryStats = Record<string, { spins: number; wins: number; earned: number }>

export type NoteKind = 'note' | 'dream'

export type NoteItem = {
  id: string
  kind: NoteKind
  title: string
  body: string
  parentId?: string | null
  icon?: string | null
  createdAt: string
  updatedAt: string
}

export type ShopItemKey =
  | 'lottery'
  | 'statham'
  | 'cat_wizard'
  | 'cat_cyber'
  | 'theme_spring'
  | 'theme_summer'
  | 'theme_autumn'
  | 'theme_winter'
  | 'theme_cyberpunk'
  | 'theme_midnight_gold'
  | 'theme_violet'
  | 'theme_anime'
  | 'sound_lofi'
  | 'lang_advanced'
  | 'notes_advanced'
  | 'view_normal'
  | 'finance_advice'
  | 'motion_pro'
export type CatSkinId = 'classic' | 'wizard' | 'cyber'
export type ThemeSkinId = 'default' | 'spring' | 'summer' | 'autumn' | 'winter' | 'cyberpunk' | 'midnight_gold' | 'violet' | 'anime'

export type ShopStateData = {
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

export type ViewMode = 'simple' | 'normal'

export type CornerStyle = 'round' | 'middle' | 'square'

export type ViewModesData = {
  globalMode: ViewMode
  pageModes: Record<string, ViewMode>
  avatarMode: ViewMode
  cornerStyle: CornerStyle
}

export type SyncSnapshot = {
  settings: SettingsData
  training: {
    days: Record<string, string[]>
    sports: TrainingSport[]
  }
  finance: {
    entries: FinanceEntry[]
    balance: Record<Currency, number>
    rates: Record<Currency, number>
    ratesSource: string
  }
  productivity: {
    items: ProductivityItem[]
    months: Record<string, ProductivityMonthRecord>
    mood: Record<string, MoodEntry>
  }
  subscriptions: {
    items: Subscription[]
  }
  birthdays: {
    ownBirthday: string
    birthdays: Birthday[]
  }
  availability: {
    windows: AvailabilityWindow[]
  }
  collection: {
    movies: { wishlist: CollectionItem[]; watched: CollectionItem[] }
    books: { wishlist: CollectionItem[]; watched: CollectionItem[] }
    games: { wishlist: CollectionItem[]; watched: CollectionItem[] }
  }
  favorites: Favorite[]
  lottery: LotteryStats
  notes: NoteItem[]
  shop: ShopStateData
  viewModes: ViewModesData
}

export const CONTACT_TOPICS = ['support', 'idea', 'bug'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export type ContactMessage = {
  id: string
  userId: string | null
  email: string
  topic: string
  body: string
  status: string
  createdAt: string
}

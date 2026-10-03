import * as v from 'valibot'
import type { SyncSnapshot } from '../../data'

export const SettingSchema = v.looseObject({
  lang: v.optional(v.string()),
  themeMode: v.optional(v.string()),
  cityId: v.optional(v.string()),
  scope: v.optional(v.string()),
  extraTab: v.optional(v.boolean()),
  startPage: v.optional(v.string()),
  blocks: v.optional(v.record(v.string(), v.boolean())),
  allowFriendTasks: v.optional(v.boolean()),
  hiddenSections: v.optional(v.array(v.string())),
})

export const TrainingSportSchema = v.looseObject({
  id: v.string(),
  label: v.string(),
  color: v.string(),
  enabled: v.boolean(),
  custom: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
})

export const TrainingSchema = v.looseObject({
  days: v.optional(v.record(v.string(), v.array(v.string()))),
  sports: v.optional(v.array(TrainingSportSchema)),
})

export const FinanceEntrySchema = v.looseObject({
  id: v.string(),
  month: v.string(),
  kind: v.string(),
  amount: v.number(),
  currency: v.string(),
  note: v.string(),
  createdAt: v.string(),
})

export const DepositSchema = v.looseObject({
  id: v.string(),
  title: v.string(),
  bank: v.string(),
  amount: v.number(),
  currency: v.string(),
  rate: v.number(),
  startDate: v.string(),
  periodMonths: v.number(),
  isCapitalized: v.boolean(),
  canDeposit: v.optional(v.boolean()),
  canWithdraw: v.optional(v.boolean()),
  note: v.optional(v.string()),
  createdAt: v.string(),
})

export const LoanSchema = v.looseObject({
  id: v.string(),
  title: v.string(),
  bank: v.string(),
  initialAmount: v.number(),
  remainingAmount: v.number(),
  currency: v.string(),
  rate: v.number(),
  monthlyPayment: v.number(),
  paymentDay: v.number(),
  startDate: v.string(),
  endDate: v.string(),
  note: v.optional(v.string()),
  createdAt: v.string(),
})

export const FinanceSchema = v.looseObject({
  entries: v.optional(v.array(FinanceEntrySchema)),
  deposits: v.optional(v.array(DepositSchema)),
  loans: v.optional(v.array(LoanSchema)),
  balance: v.optional(v.record(v.string(), v.number())),
  rates: v.optional(v.record(v.string(), v.number())),
  ratesSource: v.optional(v.string()),
})

export const ProductivityItemSchema = v.looseObject({
  id: v.string(),
  text: v.string(),
  done: v.boolean(),
  kind: v.string(),
  repeat: v.optional(v.string()),
  repeatDays: v.optional(v.array(v.number())),
  streak: v.optional(v.number()),
  lastDoneDate: v.optional(v.nullable(v.string())),
  completionHistory: v.optional(v.array(v.string())),
  targetDate: v.optional(v.string()),
  deadline: v.optional(v.nullable(v.string())),
  createdDate: v.optional(v.string()),
  senderId: v.optional(v.nullable(v.string())),
  senderName: v.optional(v.nullable(v.string())),
})

export const ProductivitySchema = v.looseObject({
  items: v.optional(v.array(ProductivityItemSchema)),
  months: v.optional(v.record(v.string(), v.any())),
  mood: v.optional(v.record(v.string(), v.any())),
})

export const SubscriptionSchema = v.looseObject({
  id: v.string(),
  name: v.string(),
  price: v.number(),
  currency: v.string(),
  period: v.string(),
  startedAt: v.string(),
  until: v.optional(v.nullable(v.string())),
  note: v.optional(v.string()),
})

export const SubscriptionsSchema = v.looseObject({
  items: v.optional(v.array(SubscriptionSchema)),
})

export const BirthdayItemSchema = v.looseObject({
  id: v.string(),
  name: v.string(),
  date: v.string(),
})

export const BirthdaysSchema = v.looseObject({
  ownBirthday: v.optional(v.string()),
  birthdays: v.optional(v.array(BirthdayItemSchema)),
})

export const CollectionMediaSchema = v.looseObject({
  wishlist: v.optional(v.array(v.any())),
  watched: v.optional(v.array(v.any())),
})

export const CollectionSchema = v.looseObject({
  movies: v.optional(CollectionMediaSchema),
  books: v.optional(CollectionMediaSchema),
  games: v.optional(CollectionMediaSchema),
})

export const NoteItemSchema = v.looseObject({
  id: v.string(),
  kind: v.string(),
  title: v.string(),
  body: v.string(),
  parentId: v.optional(v.nullable(v.string())),
  icon: v.optional(v.nullable(v.string())),
  createdAt: v.string(),
  updatedAt: v.string(),
})

export const AvailabilityWindowSchema = v.looseObject({
  id: v.string(),
  userId: v.optional(v.string()),
  scope: v.optional(v.string()),
  dayOfWeek: v.optional(v.nullable(v.number())),
  date: v.optional(v.nullable(v.string())),
  startMin: v.number(),
  endMin: v.number(),
  note: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
})

export const AvailabilitySchema = v.looseObject({
  windows: v.optional(v.array(AvailabilityWindowSchema)),
})

export const FavoriteItemSchema = v.looseObject({
  id: v.string(),
  name: v.optional(v.string()),
  breed: v.optional(v.string()),
  image: v.optional(v.string()),
  addedAt: v.optional(v.string()),
})

export const LotteryStatsSchema = v.record(
  v.string(),
  v.looseObject({
    spins: v.optional(v.number()),
    wins: v.optional(v.number()),
    earned: v.optional(v.number()),
  }),
)

export const ShopSchema = v.looseObject({
  coins: v.optional(v.number()),
  unlockedParts: v.optional(v.record(v.string(), v.boolean())),
  activeCatSkin: v.optional(v.picklist(['classic', 'wizard', 'cyber'])),
  activeThemeSkin: v.optional(
    v.picklist(['default', 'spring', 'summer', 'autumn', 'winter', 'cyberpunk', 'midnight_gold', 'violet', 'anime']),
  ),
  greetingSent: v.optional(v.boolean()),
  greetingFriendName: v.optional(v.string()),
  greetingTimestamp: v.optional(v.nullable(v.number())),
  greetingRewardClaimed: v.optional(v.boolean()),
  hasPendingGreetingReply: v.optional(v.boolean()),
})

export const ViewModeSchema = v.picklist(['simple', 'normal'])

export const ViewModesSchema = v.looseObject({
  globalMode: v.optional(ViewModeSchema),
  pageModes: v.optional(v.record(v.string(), ViewModeSchema)),
  avatarMode: v.optional(ViewModeSchema),
  cornerStyle: v.optional(v.picklist(['round', 'middle', 'square'])),
})

export const SyncSnapshotSchema = v.looseObject({
  settings: v.optional(SettingSchema),
  training: v.optional(TrainingSchema),
  finance: v.optional(FinanceSchema),
  productivity: v.optional(ProductivitySchema),
  subscriptions: v.optional(SubscriptionsSchema),
  birthdays: v.optional(BirthdaysSchema),
  collection: v.optional(CollectionSchema),
  favorites: v.optional(v.array(FavoriteItemSchema)),
  lottery: v.optional(LotteryStatsSchema),
  notes: v.optional(v.array(NoteItemSchema)),
  shop: v.optional(ShopSchema),
  viewModes: v.optional(ViewModesSchema),
  availability: v.optional(AvailabilitySchema),
})

export const validateSyncSnapshot = (data: unknown): SyncSnapshot | null => {
  if (!data || typeof data !== 'object') return null
  const result = v.safeParse(SyncSnapshotSchema, data)
  if (!result.success) return null
  return result.output as unknown as SyncSnapshot
}

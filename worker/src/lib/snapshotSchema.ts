import * as v from 'valibot'

const ViewModeSchema = v.picklist(['simple', 'normal'])
const CornerStyleSchema = v.picklist(['round', 'middle', 'square'])
const CurrencySchema = v.picklist(['RUB', 'USD', 'GEL'])

const SettingsSchema = v.looseObject({
  lang: v.optional(v.string()),
  themeMode: v.optional(v.picklist(['system', 'dark', 'light'])),
  cityId: v.optional(v.string()),
  scope: v.optional(v.picklist(['all', 'home'])),
  extraTab: v.optional(v.boolean()),
  startPage: v.optional(v.string()),
  blocks: v.optional(v.record(v.string(), v.boolean())),
  allowFriendTasks: v.optional(v.boolean()),
})

const TrainingSportSchema = v.looseObject({
  id: v.optional(v.string()),
  label: v.string(),
  color: v.string(),
  enabled: v.optional(v.boolean()),
  custom: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
})

const TrainingSchema = v.looseObject({
  days: v.optional(v.record(v.string(), v.array(v.string()))),
  sports: v.optional(v.array(TrainingSportSchema)),
})

const FinanceEntrySchema = v.looseObject({
  id: v.optional(v.string()),
  month: v.string(),
  kind: v.picklist(['salary', 'oneoff']),
  amount: v.number(),
  currency: CurrencySchema,
  note: v.optional(v.string()),
  createdAt: v.optional(v.string()),
})

const FinanceSchema = v.looseObject({
  entries: v.optional(v.array(FinanceEntrySchema)),
  balance: v.optional(v.record(v.string(), v.number())),
  rates: v.optional(v.record(v.string(), v.number())),
  ratesSource: v.optional(v.string()),
})

const ProductivityItemSchema = v.looseObject({
  id: v.optional(v.string()),
  kind: v.picklist(['task', 'goal', 'dream']),
  title: v.string(),
  date: v.optional(v.string()),
  repeat: v.optional(v.string()),
  done: v.optional(v.boolean()),
  doneAt: v.optional(v.nullable(v.string())),
  priority: v.optional(v.nullable(v.string())),
  note: v.optional(v.string()),
  senderId: v.optional(v.nullable(v.string())),
  senderName: v.optional(v.nullable(v.string())),
  createdAt: v.optional(v.string()),
})

const ProductivityMonthSchema = v.looseObject({
  points: v.optional(v.number()),
  counts: v.optional(
    v.looseObject({
      task: v.optional(v.number()),
      goal: v.optional(v.number()),
      dream: v.optional(v.number()),
    }),
  ),
})

const MoodEntrySchema = v.looseObject({
  level: v.number(),
  note: v.optional(v.string()),
})

const ProductivitySchema = v.looseObject({
  items: v.optional(v.array(ProductivityItemSchema)),
  months: v.optional(v.record(v.string(), ProductivityMonthSchema)),
  mood: v.optional(v.record(v.string(), MoodEntrySchema)),
})

const SubscriptionSchema = v.looseObject({
  id: v.optional(v.string()),
  name: v.string(),
  price: v.number(),
  currency: CurrencySchema,
  period: v.picklist(['week', 'month', 'year']),
  startedAt: v.string(),
  until: v.string(),
  note: v.optional(v.string()),
})

const SubscriptionsSchema = v.looseObject({
  items: v.optional(v.array(SubscriptionSchema)),
})

const BirthdaySchema = v.looseObject({
  id: v.optional(v.string()),
  name: v.string(),
  date: v.string(),
})

const BirthdaysSchema = v.looseObject({
  ownBirthday: v.optional(v.string()),
  birthdays: v.optional(v.array(BirthdaySchema)),
})

const CollectionItemSchema = v.looseObject({
  id: v.optional(v.string()),
  title: v.string(),
  subtitle: v.optional(v.string()),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.nullable(v.string())),
  year: v.optional(v.nullable(v.number())),
  tags: v.optional(v.array(v.string())),
  score: v.optional(v.nullable(v.string())),
  addedAt: v.optional(v.string()),
  finishedAt: v.optional(v.nullable(v.string())),
  review: v.optional(v.nullable(v.string())),
  enjoyment: v.optional(v.nullable(v.number())),
  enjoymentReaction: v.optional(v.nullable(v.picklist(['fire', 'love', 'good', 'meh', 'bad']))),
  sortOrder: v.optional(v.number()),
})

const CollectionListSchema = v.looseObject({
  wishlist: v.optional(v.array(CollectionItemSchema)),
  watched: v.optional(v.array(CollectionItemSchema)),
})

const CollectionSchema = v.looseObject({
  movies: v.optional(CollectionListSchema),
  books: v.optional(CollectionListSchema),
  games: v.optional(CollectionListSchema),
})

const FavoriteSchema = v.looseObject({
  id: v.string(),
  name: v.string(),
  breed: v.string(),
  image: v.string(),
  addedAt: v.optional(v.string()),
})

const LotterySchema = v.record(
  v.string(),
  v.looseObject({
    spins: v.optional(v.number()),
    wins: v.optional(v.number()),
    earned: v.optional(v.number()),
  }),
)

const NoteSchema = v.looseObject({
  id: v.optional(v.string()),
  kind: v.optional(v.picklist(['note', 'dream'])),
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  parentId: v.optional(v.nullable(v.string())),
  icon: v.optional(v.nullable(v.string())),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
})

const ShopSchema = v.looseObject({
  activeCatSkin: v.optional(v.string()),
  activeThemeSkin: v.optional(v.string()),
  greetingSent: v.optional(v.boolean()),
  greetingFriendName: v.optional(v.string()),
  greetingTimestamp: v.optional(v.nullable(v.number())),
  greetingRewardClaimed: v.optional(v.boolean()),
  hasPendingGreetingReply: v.optional(v.boolean()),
})

const ViewModesSchema = v.looseObject({
  globalMode: v.optional(ViewModeSchema),
  pageModes: v.optional(v.record(v.string(), ViewModeSchema)),
  avatarMode: v.optional(ViewModeSchema),
  cornerStyle: v.optional(CornerStyleSchema),
})

const AvailabilityWindowSchema = v.looseObject({
  id: v.optional(v.string()),
  scope: v.optional(v.picklist(['weekly', 'date'])),
  dayOfWeek: v.optional(v.nullable(v.number())),
  date: v.optional(v.nullable(v.string())),
  startMin: v.optional(v.number()),
  endMin: v.optional(v.number()),
  note: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
})

export const SyncSnapshotSchema = v.looseObject({
  settings: v.optional(SettingsSchema),
  training: v.optional(TrainingSchema),
  finance: v.optional(FinanceSchema),
  productivity: v.optional(ProductivitySchema),
  subscriptions: v.optional(SubscriptionsSchema),
  birthdays: v.optional(BirthdaysSchema),
  collection: v.optional(CollectionSchema),
  favorites: v.optional(v.array(FavoriteSchema)),
  lottery: v.optional(LotterySchema),
  notes: v.optional(v.array(NoteSchema)),
  shop: v.optional(ShopSchema),
  viewModes: v.optional(ViewModesSchema),
  availability: v.optional(v.looseObject({ windows: v.optional(v.array(AvailabilityWindowSchema)) })),
})

export type ParsedSyncSnapshot = v.InferOutput<typeof SyncSnapshotSchema>

export const parseSyncSnapshot = (data: unknown): ParsedSyncSnapshot | null => {
  const result = v.safeParse(SyncSnapshotSchema, data)
  return result.success ? result.output : null
}

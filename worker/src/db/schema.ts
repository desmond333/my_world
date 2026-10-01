import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: text('created_at').notNull(),
  referralCode: text('referral_code').unique(),
})

export const referrals = sqliteTable('referrals', {
  id: text('id').primaryKey(),
  referrerId: text('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refereeId: text('referee_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  referrerReward: integer('referrer_reward').notNull().default(0),
  refereeReward: integer('referee_reward').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
})

export const settings = sqliteTable('settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  lang: text('lang').notNull().default('ru'),
  themeMode: text('theme_mode').notNull().default('system'),
  cityId: text('city_id').notNull().default('moscow'),
  scope: text('scope').notNull().default('all'),
  extraTab: integer('extra_tab').notNull().default(0),
  startPage: text('start_page').notNull().default('/today'),
  blocksJson: text('blocks_json').notNull().default('{}'),
  allowFriendTasks: integer('allow_friend_tasks').notNull().default(1),
})

export const trainingDays = sqliteTable('training_days', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  sportsJson: text('sports_json').notNull().default('[]'),
})

export const trainingSports = sqliteTable('training_sports', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color').notNull(),
  enabled: integer('enabled').notNull().default(1),
  custom: integer('custom').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const financeEntries = sqliteTable('finance_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(),
  kind: text('kind').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull(),
})

export const financeBalance = sqliteTable('finance_balance', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  rub: real('rub').notNull().default(0),
  usd: real('usd').notNull().default(0),
  gel: real('gel').notNull().default(0),
})

export const financeRates = sqliteTable('finance_rates', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  rub: real('rub').notNull().default(1),
  usd: real('usd').notNull().default(90),
  gel: real('gel').notNull().default(33),
  source: text('source').notNull().default('default'),
  updatedAt: text('updated_at'),
})

export const productivityItems = sqliteTable('productivity_items', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull().default(''),
  repeat: text('repeat').notNull().default('none'),
  done: integer('done').notNull().default(0),
  doneAt: text('done_at'),
  priority: text('priority'),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull(),
  senderId: text('sender_id'),
  senderName: text('sender_name'),
})

export const productivityMonths = sqliteTable(
  'productivity_months',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    monthKey: text('month_key').notNull(),
    points: integer('points').notNull().default(0),
    taskCount: integer('task_count').notNull().default(0),
    goalCount: integer('goal_count').notNull().default(0),
    dreamCount: integer('dream_count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.monthKey] })],
)

export const productivityMood = sqliteTable(
  'productivity_mood',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    level: integer('level').notNull(),
    note: text('note').notNull().default(''),
  },
  (table) => [primaryKey({ columns: [table.userId, table.date] })],
)

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  currency: text('currency').notNull(),
  period: text('period').notNull(),
  startedAt: text('started_at').notNull(),
  until: text('until').notNull(),
  note: text('note').notNull().default(''),
})

export const birthdays = sqliteTable('birthdays', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: text('date').notNull(),
})

export const ownBirthday = sqliteTable('own_birthday', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
})

export const collectionItems = sqliteTable('collection_items', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  collection: text('collection').notNull(),
  listKey: text('list_key').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull().default(''),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url'),
  year: integer('year'),
  tagsJson: text('tags_json').notNull().default('[]'),
  score: text('score'),
  addedAt: text('added_at').notNull(),
  finishedAt: text('finished_at'),
  review: text('review'),
  enjoyment: integer('enjoyment'),
  enjoymentReaction: text('enjoyment_reaction'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  animalId: text('animal_id').notNull(),
  name: text('name').notNull(),
  breed: text('breed').notNull(),
  image: text('image').notNull(),
  addedAt: text('added_at').notNull(),
})

export const lotteryStats = sqliteTable(
  'lottery_stats',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sectorId: text('sector_id').notNull(),
    spins: integer('spins').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    earned: real('earned').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.sectorId] })],
)

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('note'),
  title: text('title').notNull().default(''),
  body: text('body').notNull().default(''),
  parentId: text('parent_id'),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const shopState = sqliteTable('shop_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  coins: integer('coins').notNull().default(1000),
  unlockedPartsJson: text('unlocked_parts_json').notNull().default('{}'),
  activeCatSkin: text('active_cat_skin').notNull().default('classic'),
  activeThemeSkin: text('active_theme_skin').notNull().default('default'),
  greetingSent: integer('greeting_sent').notNull().default(0),
  greetingFriendName: text('greeting_friend_name').notNull().default(''),
  greetingTimestamp: integer('greeting_timestamp'),
  greetingRewardClaimed: integer('greeting_reward_claimed').notNull().default(0),
  hasPendingGreetingReply: integer('has_pending_greeting_reply').notNull().default(0),
})

export const viewModes = sqliteTable('view_modes', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  globalMode: text('global_mode').notNull().default('simple'),
  pageModesJson: text('page_modes_json').notNull().default('{}'),
  avatarMode: text('avatar_mode').notNull().default('simple'),
})

export const friendships = sqliteTable('friendships', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friendId: text('friend_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const availabilityWindows = sqliteTable('availability_windows', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scope: text('scope').notNull().default('weekly'),
  dayOfWeek: integer('day_of_week'),
  date: text('date'),
  startMin: integer('start_min').notNull(),
  endMin: integer('end_min').notNull(),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

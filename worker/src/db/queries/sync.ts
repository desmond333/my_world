import { getAvailabilityWindows } from './availability'
import { getSettings } from './settings'
import { getTrainingDays, getTrainingSports } from './training'
import { getFinanceBalance, getFinanceEntries, getFinanceRates } from './finance'
import { getProductivityItems, getProductivityMonths, getProductivityMood } from './productivity'
import { getSubscriptions } from './subscriptions'
import { getBirthdays } from './birthdays'
import { getCollectionItems } from './collection'
import { getFavorites } from './favorites'
import { getLotteryStats } from './lottery'
import { getNotes } from './notes'
import { getShopState } from './shop'
import { getViewModes } from './viewModes'
import type { CollectionItem, SyncSnapshot } from '../../types'
import { MINUTES_IN_DAY } from '../../types'

export const getSyncSnapshot = async (db: D1Database, userId: string): Promise<SyncSnapshot> => {
  const [
    settings,
    trainingDays,
    trainingSports,
    financeEntries,
    financeBalance,
    financeRates,
    productivityItems,
    productivityMonths,
    productivityMood,
    subscriptions,
    birthdays,
    movies,
    books,
    games,
    favorites,
    lottery,
    notes,
    shop,
    viewModes,
    availability,
  ] = await Promise.all([
    getSettings(db, userId),
    getTrainingDays(db, userId),
    getTrainingSports(db, userId),
    getFinanceEntries(db, userId, undefined, 1000, 0),
    getFinanceBalance(db, userId),
    getFinanceRates(db, userId),
    getProductivityItems(db, userId, undefined, undefined, 1000, 0),
    getProductivityMonths(db, userId),
    getProductivityMood(db, userId),
    getSubscriptions(db, userId),
    getBirthdays(db, userId),
    getCollectionItems(db, userId, 'movies'),
    getCollectionItems(db, userId, 'books'),
    getCollectionItems(db, userId, 'games'),
    getFavorites(db, userId),
    getLotteryStats(db, userId),
    getNotes(db, userId, undefined, 1000, 0),
    getShopState(db, userId),
    getViewModes(db, userId),
    getAvailabilityWindows(db, userId),
  ])

  const splitCollection = (items: CollectionItem[]) => ({
    wishlist: items.filter(
      (item) => (item as unknown as { listKey?: string }).listKey === 'wishlist' || !('finishedAt' in item && item.finishedAt),
    ),
    watched: items.filter((item) => (item as unknown as { listKey?: string }).listKey === 'watched' || Boolean(item.finishedAt)),
  })

  return {
    settings,
    training: {
      days: trainingDays,
      sports: trainingSports,
    },
    finance: {
      entries: financeEntries,
      balance: financeBalance,
      rates: financeRates.rates,
      ratesSource: financeRates.source,
    },
    productivity: {
      items: productivityItems,
      months: productivityMonths,
      mood: productivityMood,
    },
    subscriptions: {
      items: subscriptions,
    },
    birthdays,
    collection: {
      movies: splitCollection(movies),
      books: splitCollection(books),
      games: splitCollection(games),
    },
    favorites,
    lottery,
    notes,
    shop,
    viewModes,
    availability: {
      windows: availability,
    },
  }
}

export const applySyncSnapshot = async (db: D1Database, userId: string, snapshot: SyncSnapshot): Promise<void> => {
  const statements: D1PreparedStatement[] = []

  if (snapshot.settings) {
    statements.push(
      db
        .prepare(
          `INSERT INTO settings (user_id, lang, theme_mode, city_id, scope, extra_tab, start_page, blocks_json, allow_friend_tasks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             lang = excluded.lang,
             theme_mode = excluded.theme_mode,
             city_id = excluded.city_id,
             scope = excluded.scope,
             extra_tab = excluded.extra_tab,
             start_page = excluded.start_page,
             blocks_json = excluded.blocks_json,
             allow_friend_tasks = excluded.allow_friend_tasks`,
        )
        .bind(
          userId,
          snapshot.settings.lang || 'ru',
          snapshot.settings.themeMode || 'system',
          snapshot.settings.cityId || 'moscow',
          snapshot.settings.scope || 'all',
          snapshot.settings.extraTab ? 1 : 0,
          snapshot.settings.startPage || '/today',
          JSON.stringify(snapshot.settings.blocks || {}),
          snapshot.settings.allowFriendTasks ? 1 : 0,
        ),
    )
  }

  if (snapshot.training) {
    statements.push(db.prepare('DELETE FROM training_days WHERE user_id = ?').bind(userId))
    if (snapshot.training.days) {
      for (const [date, sports] of Object.entries(snapshot.training.days)) {
        const id = `${userId}_${date}`
        statements.push(
          db
            .prepare(
              `INSERT INTO training_days (id, user_id, date, sports_json)
               VALUES (?, ?, ?, ?)`,
            )
            .bind(id, userId, date, JSON.stringify(sports)),
        )
      }
    }

    statements.push(db.prepare('DELETE FROM training_sports WHERE user_id = ?').bind(userId))
    if (Array.isArray(snapshot.training.sports)) {
      for (let i = 0; i < snapshot.training.sports.length; i++) {
        const sport = snapshot.training.sports[i]
        const id = sport.id || crypto.randomUUID()
        statements.push(
          db
            .prepare(
              `INSERT INTO training_sports (id, user_id, label, color, enabled, custom, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(id, userId, sport.label, sport.color, sport.enabled ? 1 : 0, sport.custom ? 1 : 0, sport.sortOrder ?? i),
        )
      }
    }
  }

  if (snapshot.finance) {
    statements.push(db.prepare('DELETE FROM finance_entries WHERE user_id = ?').bind(userId))
    if (Array.isArray(snapshot.finance.entries)) {
      for (const entry of snapshot.finance.entries) {
        statements.push(
          db
            .prepare(
              `INSERT INTO finance_entries (id, user_id, month, kind, amount, currency, note, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              entry.id || crypto.randomUUID(),
              userId,
              entry.month,
              entry.kind,
              entry.amount,
              entry.currency,
              entry.note || '',
              entry.createdAt || new Date().toISOString(),
            ),
        )
      }
    }

    if (snapshot.finance.balance) {
      statements.push(
        db
          .prepare(
            `INSERT INTO finance_balance (user_id, rub, usd, gel)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
               rub = excluded.rub,
               usd = excluded.usd,
               gel = excluded.gel`,
          )
          .bind(userId, snapshot.finance.balance.RUB ?? 0, snapshot.finance.balance.USD ?? 0, snapshot.finance.balance.GEL ?? 0),
      )
    }

    if (snapshot.finance.rates) {
      statements.push(
        db
          .prepare(
            `INSERT INTO finance_rates (user_id, rub, usd, gel, source, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
               rub = excluded.rub,
               usd = excluded.usd,
               gel = excluded.gel,
               source = excluded.source,
               updated_at = excluded.updated_at`,
          )
          .bind(
            userId,
            snapshot.finance.rates.RUB ?? 1,
            snapshot.finance.rates.USD ?? 90,
            snapshot.finance.rates.GEL ?? 33,
            snapshot.finance.ratesSource || 'server',
            new Date().toISOString(),
          ),
      )
    }
  }

  if (snapshot.productivity) {
    statements.push(
      db.prepare('DELETE FROM productivity_items WHERE user_id = ? AND (sender_id IS NULL OR sender_id = ?)').bind(userId, userId),
    )
    if (Array.isArray(snapshot.productivity.items)) {
      for (const item of snapshot.productivity.items) {
        statements.push(
          db
            .prepare(
              `INSERT INTO productivity_items (id, user_id, kind, title, date, repeat, done, done_at, priority, note, sender_id, sender_name, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET
                 kind = excluded.kind,
                 title = excluded.title,
                 date = excluded.date,
                 repeat = excluded.repeat,
                 done = excluded.done,
                 done_at = excluded.done_at,
                 priority = excluded.priority,
                 note = excluded.note,
                 sender_id = COALESCE(excluded.sender_id, productivity_items.sender_id),
                 sender_name = COALESCE(excluded.sender_name, productivity_items.sender_name)`,
            )
            .bind(
              item.id || crypto.randomUUID(),
              userId,
              item.kind,
              item.title,
              item.date || '',
              item.repeat || 'none',
              item.done ? 1 : 0,
              item.doneAt ?? null,
              item.priority ?? null,
              item.note || '',
              item.senderId ?? null,
              item.senderName ?? null,
              item.createdAt || new Date().toISOString(),
            ),
        )
      }
    }

    statements.push(db.prepare('DELETE FROM productivity_months WHERE user_id = ?').bind(userId))
    if (snapshot.productivity.months) {
      for (const [key, month] of Object.entries(snapshot.productivity.months)) {
        statements.push(
          db
            .prepare(
              `INSERT INTO productivity_months (user_id, month_key, points, task_count, goal_count, dream_count)
               VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .bind(userId, key, month.points || 0, month.counts?.task || 0, month.counts?.goal || 0, month.counts?.dream || 0),
        )
      }
    }

    statements.push(db.prepare('DELETE FROM productivity_mood WHERE user_id = ?').bind(userId))
    if (snapshot.productivity.mood) {
      for (const [date, entry] of Object.entries(snapshot.productivity.mood)) {
        statements.push(
          db
            .prepare(
              `INSERT INTO productivity_mood (user_id, date, level, note)
               VALUES (?, ?, ?, ?)`,
            )
            .bind(userId, date, entry.level, entry.note || ''),
        )
      }
    }
  }

  if (snapshot.subscriptions) {
    statements.push(db.prepare('DELETE FROM subscriptions WHERE user_id = ?').bind(userId))
    if (Array.isArray(snapshot.subscriptions.items)) {
      for (const sub of snapshot.subscriptions.items) {
        statements.push(
          db
            .prepare(
              `INSERT INTO subscriptions (id, user_id, name, price, currency, period, started_at, until, note)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              sub.id || crypto.randomUUID(),
              userId,
              sub.name,
              sub.price,
              sub.currency,
              sub.period,
              sub.startedAt,
              sub.until,
              sub.note || '',
            ),
        )
      }
    }
  }

  if (snapshot.birthdays) {
    statements.push(db.prepare('DELETE FROM birthdays WHERE user_id = ?').bind(userId))
    if (Array.isArray(snapshot.birthdays.birthdays)) {
      for (const b of snapshot.birthdays.birthdays) {
        statements.push(
          db
            .prepare('INSERT INTO birthdays (id, user_id, name, date) VALUES (?, ?, ?, ?)')
            .bind(b.id || crypto.randomUUID(), userId, b.name, b.date),
        )
      }
    }

    if (snapshot.birthdays.ownBirthday) {
      statements.push(
        db
          .prepare(
            `INSERT INTO own_birthday (user_id, date)
             VALUES (?, ?)
             ON CONFLICT(user_id) DO UPDATE SET date = excluded.date`,
          )
          .bind(userId, snapshot.birthdays.ownBirthday),
      )
    }
  }

  if (snapshot.collection) {
    statements.push(db.prepare('DELETE FROM collection_items WHERE user_id = ?').bind(userId))
    const collections = ['movies', 'books', 'games'] as const
    for (const col of collections) {
      const colData = snapshot.collection[col]
      if (!colData) continue
      const lists = ['wishlist', 'watched'] as const
      for (const listKey of lists) {
        const items = colData[listKey] || []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          statements.push(
            db
              .prepare(
                `INSERT INTO collection_items (
                  id, user_id, collection, list_key, title, subtitle, description,
                  image_url, year, tags_json, score, added_at, finished_at,
                  review, enjoyment, enjoyment_reaction, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(
                item.id || crypto.randomUUID(),
                userId,
                col,
                listKey,
                item.title,
                item.subtitle || '',
                item.description || '',
                item.imageUrl ?? null,
                item.year ?? null,
                JSON.stringify(item.tags || []),
                item.score ?? null,
                item.addedAt || new Date().toISOString(),
                item.finishedAt ?? null,
                item.review ?? null,
                item.enjoyment ?? null,
                item.enjoymentReaction ?? null,
                item.sortOrder ?? i,
              ),
          )
        }
      }
    }
  }

  if (Array.isArray(snapshot.favorites)) {
    statements.push(db.prepare('DELETE FROM favorites WHERE user_id = ?').bind(userId))
    for (const fav of snapshot.favorites) {
      statements.push(
        db
          .prepare(
            `INSERT INTO favorites (id, user_id, animal_id, name, breed, image, added_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(`${userId}_${fav.id}`, userId, fav.id, fav.name, fav.breed, fav.image, fav.addedAt || new Date().toISOString()),
      )
    }
  }

  if (snapshot.lottery) {
    statements.push(db.prepare('DELETE FROM lottery_stats WHERE user_id = ?').bind(userId))
    for (const [sectorId, entry] of Object.entries(snapshot.lottery)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO lottery_stats (user_id, sector_id, spins, wins, earned)
             VALUES (?, ?, ?, ?, ?)`,
          )
          .bind(userId, sectorId, entry.spins || 0, entry.wins || 0, entry.earned || 0),
      )
    }
  }

  if (Array.isArray(snapshot.notes)) {
    statements.push(db.prepare('DELETE FROM notes WHERE user_id = ?').bind(userId))
    for (const note of snapshot.notes) {
      const now = new Date().toISOString()
      statements.push(
        db
          .prepare(
            `INSERT INTO notes (id, user_id, kind, title, body, parent_id, icon, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            note.id || crypto.randomUUID(),
            userId,
            note.kind || 'note',
            note.title || '',
            note.body || '',
            note.parentId ?? null,
            note.icon ?? null,
            note.createdAt || now,
            note.updatedAt || now,
          ),
      )
    }
  }

  if (snapshot.shop) {
    // coins и unlockedParts — серверные (начисление через /api/shop/earn и /api/shop/buy),
    // из клиентского снимка синхронизируется только косметика и приветствия.
    statements.push(
      db
        .prepare(
          `INSERT INTO shop_state (
            user_id, coins, unlocked_parts_json, active_cat_skin, active_theme_skin,
            greeting_sent, greeting_friend_name, greeting_timestamp,
            greeting_reward_claimed, has_pending_greeting_reply
          ) VALUES (?, 1000, '{}', ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            active_cat_skin = excluded.active_cat_skin,
            active_theme_skin = excluded.active_theme_skin,
            greeting_sent = excluded.greeting_sent,
            greeting_friend_name = excluded.greeting_friend_name,
            greeting_timestamp = excluded.greeting_timestamp,
            greeting_reward_claimed = excluded.greeting_reward_claimed,
            has_pending_greeting_reply = excluded.has_pending_greeting_reply`,
        )
        .bind(
          userId,
          snapshot.shop.activeCatSkin || 'classic',
          snapshot.shop.activeThemeSkin || 'default',
          snapshot.shop.greetingSent ? 1 : 0,
          snapshot.shop.greetingFriendName || '',
          snapshot.shop.greetingTimestamp ?? null,
          snapshot.shop.greetingRewardClaimed ? 1 : 0,
          snapshot.shop.hasPendingGreetingReply ? 1 : 0,
        ),
    )
  }

  if (snapshot.viewModes) {
    statements.push(
      db
        .prepare(
          `INSERT INTO view_modes (user_id, global_mode, page_modes_json, avatar_mode)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             global_mode = excluded.global_mode,
             page_modes_json = excluded.page_modes_json,
             avatar_mode = excluded.avatar_mode`,
        )
        .bind(
          userId,
          snapshot.viewModes.globalMode || 'simple',
          JSON.stringify(snapshot.viewModes.pageModes || {}),
          snapshot.viewModes.avatarMode || 'simple',
        ),
    )
  }

  if (snapshot.availability && Array.isArray(snapshot.availability.windows)) {
    statements.push(db.prepare('DELETE FROM availability_windows WHERE user_id = ?').bind(userId))
    for (const window of snapshot.availability.windows) {
      const now = new Date().toISOString()
      const startMin = Number(window.startMin)
      const endMin = Number(window.endMin)

      if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) continue
      if (startMin < 0 || startMin >= MINUTES_IN_DAY || endMin <= 0 || endMin > MINUTES_IN_DAY) continue
      if (endMin <= startMin) continue

      const scope = window.scope === 'date' ? 'date' : 'weekly'
      const rawDay = Number(window.dayOfWeek)
      const dayOfWeek = scope === 'weekly' && Number.isInteger(rawDay) ? rawDay : null
      const date = scope === 'date' && typeof window.date === 'string' ? window.date.trim() : null

      if (scope === 'weekly' && (dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6)) continue
      if (scope === 'date' && !date) continue

      statements.push(
        db
          .prepare(
            `INSERT INTO availability_windows (
              id, user_id, scope, day_of_week, date, start_min, end_min, note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            window.id || crypto.randomUUID(),
            userId,
            scope,
            dayOfWeek,
            date,
            startMin,
            endMin,
            (window.note || '').slice(0, 500),
            window.createdAt || now,
            window.updatedAt || now,
          ),
      )
    }
  }

  const BATCH_SIZE = 100
  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const chunk = statements.slice(i, i + BATCH_SIZE)
    await db.batch(chunk)
  }
}

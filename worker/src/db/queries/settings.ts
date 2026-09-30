import { parseJson } from '../client'
import type { SettingsData } from '../../types'

type SettingsRow = {
  user_id: string
  lang: string
  theme_mode: string
  city_id: string
  scope: string
  extra_tab: number
  start_page: string
  blocks_json: string
  allow_friend_tasks?: number
}

const DEFAULT_SETTINGS: SettingsData = {
  lang: 'ru',
  themeMode: 'system',
  cityId: 'moscow',
  scope: 'all',
  extraTab: false,
  startPage: '/today',
  blocks: {
    animal: true,
    today: true,
    weather: true,
    wish: true,
    occasion: true,
    training: true,
  },
  allowFriendTasks: true,
}

export const getSettings = async (db: D1Database, userId: string): Promise<SettingsData> => {
  const row = await db.prepare('SELECT * FROM settings WHERE user_id = ?').bind(userId).first<SettingsRow>()

  if (!row) {
    return DEFAULT_SETTINGS
  }

  return {
    lang: row.lang,
    themeMode: row.theme_mode as SettingsData['themeMode'],
    cityId: row.city_id,
    scope: row.scope as SettingsData['scope'],
    extraTab: Boolean(row.extra_tab),
    startPage: row.start_page || '/today',
    blocks: parseJson(row.blocks_json, DEFAULT_SETTINGS.blocks),
    allowFriendTasks: row.allow_friend_tasks !== undefined ? Boolean(row.allow_friend_tasks) : true,
  }
}

export const upsertSettings = async (db: D1Database, userId: string, data: Partial<SettingsData>): Promise<SettingsData> => {
  const current = await getSettings(db, userId)
  const merged: SettingsData = {
    ...current,
    ...data,
    blocks: data.blocks ? { ...current.blocks, ...data.blocks } : current.blocks,
    allowFriendTasks: data.allowFriendTasks !== undefined ? data.allowFriendTasks : current.allowFriendTasks,
  }

  await db
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
      merged.lang,
      merged.themeMode,
      merged.cityId,
      merged.scope,
      merged.extraTab ? 1 : 0,
      merged.startPage,
      JSON.stringify(merged.blocks),
      merged.allowFriendTasks ? 1 : 0,
    )
    .run()

  return merged
}

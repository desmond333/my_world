import { eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { settings } from '../schema'
import type { SettingsData } from '../../types'

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

export const getSettings = async (d1: D1Database, userId: string): Promise<SettingsData> => {
  const db = getDb(d1)
  const row = await db.select().from(settings).where(eq(settings.userId, userId)).get()

  if (!row) {
    return DEFAULT_SETTINGS
  }

  return {
    lang: row.lang,
    themeMode: row.themeMode as SettingsData['themeMode'],
    cityId: row.cityId,
    scope: row.scope as SettingsData['scope'],
    extraTab: Boolean(row.extraTab),
    startPage: row.startPage || '/today',
    blocks: parseJson(row.blocksJson, DEFAULT_SETTINGS.blocks),
    allowFriendTasks: row.allowFriendTasks !== null && row.allowFriendTasks !== undefined ? Boolean(row.allowFriendTasks) : true,
  }
}

export const upsertSettings = async (d1: D1Database, userId: string, data: Partial<SettingsData>): Promise<SettingsData> => {
  const current = await getSettings(d1, userId)
  const merged: SettingsData = {
    ...current,
    ...data,
    blocks: data.blocks ? { ...current.blocks, ...data.blocks } : current.blocks,
    allowFriendTasks: data.allowFriendTasks !== undefined ? data.allowFriendTasks : current.allowFriendTasks,
  }

  const db = getDb(d1)
  await db
    .insert(settings)
    .values({
      userId,
      lang: merged.lang,
      themeMode: merged.themeMode,
      cityId: merged.cityId,
      scope: merged.scope,
      extraTab: merged.extraTab ? 1 : 0,
      startPage: merged.startPage,
      blocksJson: JSON.stringify(merged.blocks),
      allowFriendTasks: merged.allowFriendTasks ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: settings.userId,
      set: {
        lang: merged.lang,
        themeMode: merged.themeMode,
        cityId: merged.cityId,
        scope: merged.scope,
        extraTab: merged.extraTab ? 1 : 0,
        startPage: merged.startPage,
        blocksJson: JSON.stringify(merged.blocks),
        allowFriendTasks: merged.allowFriendTasks ? 1 : 0,
      },
    })

  return merged
}

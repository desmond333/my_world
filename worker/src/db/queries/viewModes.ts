import { parseJson } from '../client'
import type { ViewMode, ViewModesData } from '../../types'

type ViewModesRow = {
  user_id: string
  global_mode: string
  page_modes_json: string
  avatar_mode: string
}

const DEFAULT_VIEW_MODES: ViewModesData = {
  globalMode: 'simple',
  pageModes: {},
  avatarMode: 'simple',
}

export const getViewModes = async (db: D1Database, userId: string): Promise<ViewModesData> => {
  const row = await db.prepare('SELECT * FROM view_modes WHERE user_id = ?').bind(userId).first<ViewModesRow>()

  if (!row) return DEFAULT_VIEW_MODES

  return {
    globalMode: (row.global_mode as ViewMode) || 'simple',
    pageModes: parseJson<Record<string, ViewMode>>(row.page_modes_json, {}),
    avatarMode: (row.avatar_mode as ViewMode) || 'simple',
  }
}

export const updateViewModes = async (db: D1Database, userId: string, patch: Partial<ViewModesData>): Promise<ViewModesData> => {
  const current = await getViewModes(db, userId)
  const merged: ViewModesData = {
    globalMode: patch.globalMode ?? current.globalMode,
    pageModes: patch.pageModes ? { ...current.pageModes, ...patch.pageModes } : current.pageModes,
    avatarMode: patch.avatarMode ?? current.avatarMode,
  }

  await db
    .prepare(
      `INSERT INTO view_modes (user_id, global_mode, page_modes_json, avatar_mode)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         global_mode = excluded.global_mode,
         page_modes_json = excluded.page_modes_json,
         avatar_mode = excluded.avatar_mode`,
    )
    .bind(userId, merged.globalMode, JSON.stringify(merged.pageModes), merged.avatarMode)
    .run()

  return merged
}

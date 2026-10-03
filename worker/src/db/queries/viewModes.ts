import { eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { viewModes } from '../schema'
import type { CornerStyle, ViewMode, ViewModesData } from '../../types'

const DEFAULT_VIEW_MODES: ViewModesData = {
  globalMode: 'simple',
  pageModes: {},
  avatarMode: 'simple',
  cornerStyle: 'middle',
}

export const sanitizeViewMode = (value: unknown, fallback: ViewMode = 'simple'): ViewMode =>
  value === 'simple' || value === 'normal' ? value : fallback

export const sanitizeCornerStyle = (value: unknown): CornerStyle =>
  value === 'round' || value === 'middle' || value === 'square' ? value : 'middle'

export const sanitizePageModes = (value: unknown): Record<string, ViewMode> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, ViewMode> = {}
  for (const [key, mode] of Object.entries(value as Record<string, unknown>)) {
    if (mode === 'simple' || mode === 'normal') result[key] = mode
  }
  return result
}

export const getViewModes = async (d1: D1Database, userId: string): Promise<ViewModesData> => {
  const db = getDb(d1)
  const row = await db.select().from(viewModes).where(eq(viewModes.userId, userId)).get()

  if (!row) return DEFAULT_VIEW_MODES

  return {
    globalMode: sanitizeViewMode(row.globalMode),
    pageModes: sanitizePageModes(parseJson<Record<string, ViewMode>>(row.pageModesJson, {})),
    avatarMode: sanitizeViewMode(row.avatarMode),
    cornerStyle: sanitizeCornerStyle(row.cornerStyle),
  }
}

export const updateViewModes = async (d1: D1Database, userId: string, patch: Partial<ViewModesData>): Promise<ViewModesData> => {
  const current = await getViewModes(d1, userId)
  const merged: ViewModesData = {
    globalMode: patch.globalMode === undefined ? current.globalMode : sanitizeViewMode(patch.globalMode),
    pageModes: patch.pageModes ? { ...current.pageModes, ...sanitizePageModes(patch.pageModes) } : current.pageModes,
    avatarMode: patch.avatarMode === undefined ? current.avatarMode : sanitizeViewMode(patch.avatarMode),
    cornerStyle: patch.cornerStyle === undefined ? current.cornerStyle : sanitizeCornerStyle(patch.cornerStyle),
  }

  const db = getDb(d1)
  await db
    .insert(viewModes)
    .values({
      userId,
      globalMode: merged.globalMode,
      pageModesJson: JSON.stringify(merged.pageModes),
      avatarMode: merged.avatarMode,
      cornerStyle: merged.cornerStyle,
    })
    .onConflictDoUpdate({
      target: viewModes.userId,
      set: {
        globalMode: merged.globalMode,
        pageModesJson: JSON.stringify(merged.pageModes),
        avatarMode: merged.avatarMode,
        cornerStyle: merged.cornerStyle,
      },
    })

  return merged
}

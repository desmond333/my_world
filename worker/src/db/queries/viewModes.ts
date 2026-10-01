import { eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { viewModes } from '../schema'
import type { ViewMode, ViewModesData } from '../../types'

const DEFAULT_VIEW_MODES: ViewModesData = {
  globalMode: 'simple',
  pageModes: {},
  avatarMode: 'simple',
}

export const getViewModes = async (d1: D1Database, userId: string): Promise<ViewModesData> => {
  const db = getDb(d1)
  const row = await db.select().from(viewModes).where(eq(viewModes.userId, userId)).get()

  if (!row) return DEFAULT_VIEW_MODES

  return {
    globalMode: (row.globalMode as ViewMode) || 'simple',
    pageModes: parseJson<Record<string, ViewMode>>(row.pageModesJson, {}),
    avatarMode: (row.avatarMode as ViewMode) || 'simple',
  }
}

export const updateViewModes = async (d1: D1Database, userId: string, patch: Partial<ViewModesData>): Promise<ViewModesData> => {
  const current = await getViewModes(d1, userId)
  const merged: ViewModesData = {
    globalMode: patch.globalMode ?? current.globalMode,
    pageModes: patch.pageModes ? { ...current.pageModes, ...patch.pageModes } : current.pageModes,
    avatarMode: patch.avatarMode ?? current.avatarMode,
  }

  const db = getDb(d1)
  await db
    .insert(viewModes)
    .values({
      userId,
      globalMode: merged.globalMode,
      pageModesJson: JSON.stringify(merged.pageModes),
      avatarMode: merged.avatarMode,
    })
    .onConflictDoUpdate({
      target: viewModes.userId,
      set: {
        globalMode: merged.globalMode,
        pageModesJson: JSON.stringify(merged.pageModes),
        avatarMode: merged.avatarMode,
      },
    })

  return merged
}

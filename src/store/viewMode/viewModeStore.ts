import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import type { CornerStyle } from '../../data/types'

export type { CornerStyle } from '../../data/types'

export type ViewMode = 'simple' | 'normal'

export const VIEW_PAGES = [
  { id: 'today', titleKey: 'settings.page.today', defaultMode: 'simple', hasModes: true },
  { id: 'productivity', titleKey: 'settings.page.productivity', defaultMode: 'simple', hasModes: true },
  { id: 'finance', titleKey: 'settings.page.finance', defaultMode: 'simple', hasModes: true },
  { id: 'training', titleKey: 'settings.page.training', defaultMode: 'simple', hasModes: true },
  { id: 'media', titleKey: 'settings.page.media', defaultMode: 'simple', hasModes: true },
  { id: 'notes', titleKey: 'settings.page.notes', defaultMode: 'simple', hasModes: true },
] as const

export type ViewPageId = (typeof VIEW_PAGES)[number]['id']

export const pageHasModes = (pageId: ViewPageId) => VIEW_PAGES.find((page) => page.id === pageId)?.hasModes ?? false

export type ViewModeState = {
  globalMode: ViewMode
  pageModes: Partial<Record<ViewPageId, ViewMode>>
  avatarMode: ViewMode
  cornerStyle: CornerStyle
  setCornerStyle: (style: CornerStyle) => void
  setAvatarMode: (mode: ViewMode) => void
  toggleAvatarMode: () => void
  setPageMode: (pageId: ViewPageId | string, mode: ViewMode) => void
  togglePageMode: (pageId: ViewPageId | string) => void
  setAllModes: (mode: ViewMode) => void
}

const STORAGE_KEY = STORAGE_KEYS.viewModes

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      globalMode: 'simple',
      pageModes: {},
      avatarMode: 'simple',
      cornerStyle: 'middle',
      setCornerStyle: (style) => {
        set({ cornerStyle: style })
        scheduleDebouncedSync()
      },
      setAvatarMode: (mode) => {
        set({ avatarMode: mode })
        scheduleDebouncedSync()
      },
      toggleAvatarMode: () => {
        set((state) => ({
          avatarMode: (state.avatarMode ?? 'simple') === 'simple' ? 'normal' : 'simple',
        }))
        scheduleDebouncedSync()
      },
      setPageMode: (pageId, mode) => {
        set((state) => ({
          pageModes: { ...state.pageModes, [pageId as ViewPageId]: mode },
        }))
        scheduleDebouncedSync()
      },
      togglePageMode: (pageId) => {
        set((state) => {
          const current = (state.pageModes as Record<string, ViewMode>)[pageId] ?? state.globalMode ?? 'simple'
          const next: ViewMode = current === 'simple' ? 'normal' : 'simple'
          return {
            pageModes: { ...state.pageModes, [pageId as ViewPageId]: next },
          }
        })
        scheduleDebouncedSync()
      },
      setAllModes: (mode) => {
        set(() => {
          const updated: Partial<Record<ViewPageId, ViewMode>> = {}
          VIEW_PAGES.forEach((item) => {
            updated[item.id] = mode
          })
          return {
            globalMode: mode,
            pageModes: updated,
            avatarMode: mode,
          }
        })
        scheduleDebouncedSync()
      },
    }),
    {
      name: STORAGE_KEY,
      storage: hybridPersistStorage,
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<ViewModeState> | undefined
        if (!state) return persisted as ViewModeState
        const valid = state.cornerStyle === 'round' || state.cornerStyle === 'middle' || state.cornerStyle === 'square'
        return { ...state, cornerStyle: valid ? state.cornerStyle : 'middle' } as ViewModeState
      },
    },
  ),
)

export const usePageViewMode = (pageId: ViewPageId | string) => {
  const normalizedId =
    pageId === 'tasks' || pageId === 'goals' || pageId === 'dreams' ? 'productivity' : pageId === 'birthdays' ? 'remind' : pageId
  const mode = useViewModeStore((state) => (state.pageModes as Record<string, ViewMode>)[normalizedId] ?? state.globalMode ?? 'simple')
  const setPageMode = useViewModeStore((state) => state.setPageMode)
  const togglePageMode = useViewModeStore((state) => state.togglePageMode)

  return {
    mode,
    isSimple: mode === 'simple',
    isNormal: mode === 'normal',
    setMode: (next: ViewMode) => setPageMode(normalizedId, next),
    toggleMode: () => togglePageMode(normalizedId),
  }
}

export const useAvatarViewMode = () => {
  const mode = useViewModeStore((state) => state.avatarMode ?? 'simple')
  const setAvatarMode = useViewModeStore((state) => state.setAvatarMode)
  const toggleAvatarMode = useViewModeStore((state) => state.toggleAvatarMode)

  return {
    mode,
    isSimple: mode === 'simple',
    isNormal: mode === 'normal',
    setMode: setAvatarMode,
    toggleMode: toggleAvatarMode,
  }
}

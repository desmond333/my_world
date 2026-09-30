import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncService'

export type ViewMode = 'simple' | 'normal'

export const VIEW_PAGES = [
  { id: 'today', titleKey: 'settings.page.today', defaultMode: 'simple' },
  { id: 'tasks', titleKey: 'settings.page.tasks', defaultMode: 'simple' },
  { id: 'goals', titleKey: 'settings.page.goals', defaultMode: 'simple' },
  { id: 'dreams', titleKey: 'settings.page.dreams', defaultMode: 'simple' },
  { id: 'training', titleKey: 'settings.page.training', defaultMode: 'simple' },
  { id: 'finance', titleKey: 'settings.page.finance', defaultMode: 'simple' },
  { id: 'media', titleKey: 'settings.page.media', defaultMode: 'simple' },
  { id: 'subscriptions', titleKey: 'settings.page.subscriptions', defaultMode: 'simple' },
  { id: 'languages', titleKey: 'settings.page.languages', defaultMode: 'simple' },
  { id: 'favorites', titleKey: 'settings.page.favorites', defaultMode: 'simple' },
  { id: 'notes', titleKey: 'settings.page.notes', defaultMode: 'simple' },
] as const

export type ViewPageId = (typeof VIEW_PAGES)[number]['id']

export type ViewModeState = {
  globalMode: ViewMode
  pageModes: Partial<Record<ViewPageId, ViewMode>>
  avatarMode: ViewMode
  setAvatarMode: (mode: ViewMode) => void
  toggleAvatarMode: () => void
  setPageMode: (pageId: ViewPageId | string, mode: ViewMode) => void
  togglePageMode: (pageId: ViewPageId | string) => void
  setAllModes: (mode: ViewMode) => void
}

const STORAGE_KEY = 'app-view-modes'

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      globalMode: 'simple',
      pageModes: {},
      avatarMode: 'simple',
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
      version: 1,
    },
  ),
)

export const usePageViewMode = (pageId: ViewPageId | string) => {
  const mode = useViewModeStore((state) => (state.pageModes as Record<string, ViewMode>)[pageId] ?? state.globalMode ?? 'simple')
  const setPageMode = useViewModeStore((state) => state.setPageMode)
  const togglePageMode = useViewModeStore((state) => state.togglePageMode)

  return {
    mode,
    isSimple: mode === 'simple',
    isNormal: mode === 'normal',
    setMode: (next: ViewMode) => setPageMode(pageId, next),
    toggleMode: () => togglePageMode(pageId),
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

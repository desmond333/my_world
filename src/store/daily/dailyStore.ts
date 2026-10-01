import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import { defaultBlocks } from '../../data'
import { seedFromDate } from '../../lib/date'
import { useAnimalsStore } from '../animals/animalsStore'
import type { DailyState } from '../types'

const HOME_SCOPE_OFFSET = 17

export const getDateForTimezone = (timezone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const useDailyStore = create<DailyState>()(
  persist(
    (set) => ({
      date: '',
      animalIndex: 0,
      recent: [],
      cityId: 'moscow',
      scope: 'all',
      themeMode: 'system',
      themePalette: 'auto',
      lang: 'ru',
      blocks: defaultBlocks,
      extraTab: false,
      startPage: '/today',
      allowFriendTasks: true,
      hiddenSections: [],
      chooseForToday: (date, scope) =>
        set((state) => {
          if (state.date === date && state.scope === scope) return state
          const all = useAnimalsStore.getState().animals
          const available = scope === 'home' ? all.filter((animal) => animal.category === 'home') : all
          const seed = seedFromDate(date) + (scope === 'home' ? HOME_SCOPE_OFFSET : 0)
          if (!available.length) return { date, scope, animalIndex: 0, recent: state.recent }
          let index = seed % available.length
          if (available.length > 1) {
            const excluded = (state.recent ?? []).slice(-(available.length - 1))
            let guard = 0
            while (excluded.includes(index) && guard < available.length) {
              index = (index + 1) % available.length
              guard += 1
            }
          }
          return { date, scope, animalIndex: index, recent: [...(state.recent ?? []).slice(-14), index] }
        }),
      setCity: (city) => {
        set({ cityId: city.id })
        scheduleDebouncedSync()
      },
      setScope: (scope) => {
        set({ scope })
        scheduleDebouncedSync()
      },
      setThemeMode: (themeMode) => {
        set({ themeMode })
        scheduleDebouncedSync()
      },
      setThemePalette: (themePalette) => {
        set({ themePalette })
      },
      setLang: (lang) => {
        set({ lang })
        scheduleDebouncedSync()
      },
      toggleLang: () => {
        set((state) => ({ lang: (state.lang ?? 'ru') === 'ru' ? 'en' : 'ru' }))
        scheduleDebouncedSync()
      },
      toggleBlock: (key) => {
        set((state) => {
          const blocks = { ...defaultBlocks, ...state.blocks }
          return { blocks: { ...blocks, [key]: !blocks[key] } }
        })
        scheduleDebouncedSync()
      },
      toggleExtraTab: () => {
        set((state) => ({ extraTab: !state.extraTab }))
        scheduleDebouncedSync()
      },
      setStartPage: (startPage) => {
        set({ startPage })
        scheduleDebouncedSync()
      },
      setAllowFriendTasks: (allowFriendTasks) => {
        set({ allowFriendTasks })
        scheduleDebouncedSync()
      },
      hideSection: (key) => {
        set((state) => ({
          hiddenSections: [...new Set([...(state.hiddenSections ?? []), key])],
        }))
        scheduleDebouncedSync()
      },
      showSection: (key) => {
        set((state) => ({
          hiddenSections: (state.hiddenSections ?? []).filter((s) => s !== key),
        }))
        scheduleDebouncedSync()
      },
      toggleSection: (key) => {
        set((state) => {
          const list = state.hiddenSections ?? []
          const next = list.includes(key) ? list.filter((s) => s !== key) : [...list, key]
          return { hiddenSections: next }
        })
        scheduleDebouncedSync()
      },
      resetHiddenSections: () => {
        set({ hiddenSections: [] })
        scheduleDebouncedSync()
      },
    }),
    { name: STORAGE_KEYS.daily, storage: hybridPersistStorage },
  ),
)

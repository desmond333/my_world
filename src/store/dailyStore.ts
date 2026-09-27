import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultBlocks } from '../data'
import { useAnimalsStore } from './animalsStore'
import type { DailyState } from './types'

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
      themeMode: 'dark',
      blocks: defaultBlocks,
      chooseForToday: (date, scope) =>
        set((state) => {
          if (state.date === date && state.scope === scope) return state
          const all = useAnimalsStore.getState().animals
          const available = scope === 'home' ? all.filter((animal) => animal.category === 'home') : all
          const seed = date.split('-').reduce((sum, value) => sum + Number(value), 0) + (scope === 'home' ? 17 : 0)
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
      setCity: (city) => set({ cityId: city.id }),
      setScope: (scope) => set({ scope }),
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleBlock: (key) =>
        set((state) => {
          const blocks = { ...defaultBlocks, ...state.blocks }
          return { blocks: { ...blocks, [key]: !blocks[key] } }
        }),
    }),
    { name: 'animal-of-the-day' },
  ),
)

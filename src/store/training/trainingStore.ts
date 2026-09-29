import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BUILTIN_SPORTS, STRENGTH_ID, toggleIn } from '../../lib'
import type { TrainingSport } from '../../data'
import type { TrainingState } from '../types'

const withoutDay = (days: Record<string, string[]>, date: string) => {
  const next = { ...days }
  delete next[date]
  return next
}

const withKinds = (days: Record<string, string[]>, date: string, kinds: string[]) =>
  kinds.length ? { ...days, [date]: kinds } : withoutDay(days, date)

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set) => ({
      days: {},
      sports: BUILTIN_SPORTS,
      toggleSport: (date, sportId) => set((state) => ({ days: withKinds(state.days, date, toggleIn(state.days[date] ?? [], sportId)) })),
      setDay: (date, kinds) => set((state) => ({ days: withKinds(state.days, date, kinds) })),
      setSportEnabled: (id, enabled) =>
        set((state) => ({ sports: state.sports.map((sport) => (sport.id === id ? { ...sport, enabled } : sport)) })),
      addSport: (label, color) =>
        set((state) => {
          const clean = label.trim()
          if (!clean) return state
          const id = `custom-${Date.now().toString(36)}`
          const sport: TrainingSport = { id, label: clean, color, enabled: true, custom: true }
          return { sports: [...state.sports, sport] }
        }),
      removeSport: (id) =>
        set((state) => ({
          sports: state.sports.filter((sport) => sport.id !== id),
          days: Object.fromEntries(
            Object.entries(state.days)
              .map(([date, kinds]) => [date, kinds.filter((item) => item !== id)] as const)
              .filter(([, kinds]) => kinds.length > 0),
          ),
        })),
      resetTraining: () => set({ days: {} }),
    }),
    {
      name: 'animal-training',
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { days?: Record<string, unknown>; sports?: TrainingSport[] }
        const days: Record<string, string[]> = {}
        Object.entries(state.days ?? {}).forEach(([date, value]) => {
          if (Array.isArray(value)) days[date] = value as string[]
          else if (typeof value === 'string' && value) days[date] = [STRENGTH_ID]
        })
        return { days, sports: Array.isArray(state.sports) && state.sports.length ? state.sports : BUILTIN_SPORTS }
      },
    },
  ),
)

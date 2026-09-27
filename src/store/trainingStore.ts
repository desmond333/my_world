import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrainingState } from './types'

const withoutDay = (days: Record<string, string>, date: string) => {
  const next = { ...days }
  delete next[date]
  return next
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set) => ({
      days: {},
      setDay: (date, done) =>
        set((state) => ({ days: done ? { ...state.days, [date]: new Date().toISOString() } : withoutDay(state.days, date) })),
      toggleDay: (date) =>
        set((state) =>
          state.days[date] ? { days: withoutDay(state.days, date) } : { days: { ...state.days, [date]: new Date().toISOString() } },
        ),
    }),
    { name: 'animal-training' },
  ),
)

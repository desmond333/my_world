import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'animal-lottery'

export type LotteryStats = Record<string, { spins: number; wins: number; earned: number }>

export type LotteryStore = {
  stats: LotteryStats
  record: (id: string, won: boolean, prize: number) => void
  reset: () => void
}

const empty = (): LotteryStats => ({})

export const useLotteryStore = create<LotteryStore>()(
  persist(
    (set) => ({
      stats: empty(),
      record: (id, won, prize) =>
        set((state) => {
          const current = state.stats[id] ?? { spins: 0, wins: 0, earned: 0 }
          return {
            stats: {
              ...state.stats,
              [id]: {
                spins: current.spins + 1,
                wins: current.wins + (won ? 1 : 0),
                earned: current.earned + (won ? prize : 0),
              },
            },
          }
        }),
      reset: () => set({ stats: empty() }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)

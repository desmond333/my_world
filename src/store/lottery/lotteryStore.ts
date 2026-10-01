import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'

const STORAGE_KEY = STORAGE_KEYS.lottery

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
      record: (id, won, prize) => {
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
        })
        scheduleDebouncedSync()
      },
      reset: () => {
        set({ stats: empty() })
        scheduleDebouncedSync()
      },
    }),
    { name: STORAGE_KEY, storage: hybridPersistStorage, version: 1 },
  ),
)

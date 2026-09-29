import { create } from 'zustand'
import { fallbackAnimals } from '../../data'
import type { Animal } from '../../data/types'
import { loadAnimals, type AnimalsLoadResult } from '../../services/animals'

export type AnimalsSource = 'fallback' | 'wikipedia' | 'mixed'

export type AnimalsState = {
  animals: Animal[]
  status: 'idle' | 'loading' | 'ready'
  source: AnimalsSource
  fromApi: number
  failed: string[]
  load: () => Promise<void>
}

let inflight: Promise<AnimalsLoadResult> | null = null

const fallbackResult = () => ({ animals: fallbackAnimals, fromApi: 0, failed: fallbackAnimals.map((item) => item.id) })

const sourceOf = (fromApi: number, total: number): AnimalsSource => (fromApi === total ? 'wikipedia' : fromApi ? 'mixed' : 'fallback')

export const useAnimalsStore = create<AnimalsState>()((set, get) => ({
  animals: fallbackAnimals,
  status: 'idle',
  source: 'fallback',
  fromApi: 0,
  failed: [],
  load: async () => {
    if (get().status === 'ready') return
    set({ status: 'loading' })
    inflight ??= loadAnimals()
    try {
      const result = await inflight
      set({
        animals: result.animals,
        status: 'ready',
        source: sourceOf(result.fromApi, result.animals.length),
        fromApi: result.fromApi,
        failed: result.failed,
      })
    } catch {
      const result = fallbackResult()
      set({ animals: result.animals, status: 'ready', source: 'fallback', fromApi: 0, failed: result.failed })
    } finally {
      inflight = null
    }
  },
}))

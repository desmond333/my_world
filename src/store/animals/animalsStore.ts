import { create } from 'zustand'
import { animalSeeds, fallbackAnimals } from '../../data'
import type { Animal } from '../../data/types'
import { fetchAnimalFacts } from '../../services/animals'

export type AnimalsState = {
  animals: Animal[]
  status: 'idle' | 'loading' | 'ready'
  refresh: (id: string) => Promise<void>
}

const inflight = new Set<string>()

export const useAnimalsStore = create<AnimalsState>()((set) => ({
  animals: fallbackAnimals,
  status: 'ready',
  refresh: async (id) => {
    if (inflight.has(id)) return
    const seed = animalSeeds.find((item) => item.id === id)
    if (!seed) return
    inflight.add(id)
    try {
      const facts = await fetchAnimalFacts(seed).catch(() => null)
      if (!facts) return
      set((state) => ({ animals: state.animals.map((animal) => (animal.id === id ? { ...animal, ...facts } : animal)) }))
    } finally {
      inflight.delete(id)
    }
  },
}))

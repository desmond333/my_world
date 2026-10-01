import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import { fallbackAnimals } from '../../data'
import type { Favorite } from '../../data'
import { useAnimalsStore } from '../animals/animalsStore'
import type { FavoritesState } from '../types'

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isFavorite: (id) => get().favorites.some((favorite) => favorite.id === id),
      addFavorite: (animal) => {
        if (get().isFavorite(animal.id)) return
        set((state) => ({
          favorites: [
            ...state.favorites,
            { id: animal.id, name: animal.name, breed: animal.breed, image: animal.image, addedAt: new Date().toISOString() },
          ],
        }))
        scheduleDebouncedSync()
      },
      removeFavorite: (id) => {
        set((state) => ({ favorites: state.favorites.filter((favorite) => favorite.id !== id) }))
        scheduleDebouncedSync()
      },
    }),
    {
      name: STORAGE_KEYS.favorites,
      storage: hybridPersistStorage,
      version: 1,
      migrate: (state) => {
        const saved = state as { favorites?: Favorite[] }
        if (!saved?.favorites) return state
        return {
          ...(state as object),
          favorites: saved.favorites.map((favorite) => {
            const known = useAnimalsStore.getState().animals.length ? useAnimalsStore.getState().animals : fallbackAnimals
            const animal =
              known.find((item) => item.id === favorite.id) ??
              known.find((item) => item.name === favorite.name && item.breed === favorite.breed)
            return animal ? { ...favorite, id: animal.id } : favorite
          }),
        }
      },
    },
  ),
)

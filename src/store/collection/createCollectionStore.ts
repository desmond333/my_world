import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { otherCollectionList, reorderItems } from '../../lib/collection'
import type { CollectionState } from '../types'

const COLLECTION_VERSION = 2

export const createCollectionStore = (storageKey: string) =>
  create<CollectionState>()(
    persist(
      (set, get) => ({
        wishlist: [],
        watched: [],
        isIn: (list, id) => get()[list].some((item) => item.id === id),
        add: (list, item) =>
          set((state) => {
            if (state[list].some((existing) => existing.id === item.id)) return state
            const withItem = [...state[list], item]
            const withoutItem = state[otherCollectionList(list)].filter((existing) => existing.id !== item.id)
            return list === 'wishlist' ? { wishlist: withItem, watched: withoutItem } : { wishlist: withoutItem, watched: withItem }
          }),
        remove: (list, id) =>
          set((state) =>
            list === 'wishlist'
              ? { wishlist: state.wishlist.filter((item) => item.id !== id) }
              : { watched: state.watched.filter((item) => item.id !== id) },
          ),
        move: (id, to) =>
          set((state) => {
            const from = otherCollectionList(to)
            const item = state[from].find((existing) => existing.id === id)
            if (!item || state[to].some((existing) => existing.id === id)) return state
            const remaining = state[from].filter((existing) => existing.id !== id)
            const target = [...state[to], item]
            return to === 'wishlist' ? { wishlist: target, watched: remaining } : { wishlist: remaining, watched: target }
          }),
        reorder: (list, orderedIds) =>
          set((state) =>
            list === 'wishlist'
              ? { wishlist: reorderItems(state.wishlist, orderedIds) }
              : { watched: reorderItems(state.watched, orderedIds) },
          ),
        updateItem: (list, id, patch) =>
          set((state) => ({
            [list]: state[list].map((item) => (item.id === id ? { ...item, ...patch } : item)),
          })),
      }),
      { name: storageKey, version: COLLECTION_VERSION },
    ),
  )

export type CollectionStore = ReturnType<typeof createCollectionStore>

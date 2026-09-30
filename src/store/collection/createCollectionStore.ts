import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncService'
import { otherCollectionList, reorderItems } from '../../lib/collection'
import type { CollectionItem } from '../../data'
import type { CollectionState } from '../types'

const COLLECTION_VERSION = 2

const today = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const withFinishStamp = (item: CollectionItem, list: 'wishlist' | 'watched'): CollectionItem => {
  if (list === 'watched') {
    return item.finishedAt ? item : { ...item, finishedAt: today() }
  }
  const rest: CollectionItem = { ...item }
  delete rest.finishedAt
  return rest
}

export const createCollectionStore = (storageKey: string) =>
  create<CollectionState>()(
    persist(
      (set, get) => ({
        wishlist: [],
        watched: [],
        isIn: (list, id) => get()[list].some((item) => item.id === id),
        add: (list, item) => {
          set((state) => {
            if (state[list].some((existing) => existing.id === item.id)) return state
            const withItem = [...state[list], withFinishStamp(item, list)]
            const withoutItem = state[otherCollectionList(list)].filter((existing) => existing.id !== item.id)
            return list === 'wishlist' ? { wishlist: withItem, watched: withoutItem } : { wishlist: withoutItem, watched: withItem }
          })
          scheduleDebouncedSync()
        },
        remove: (list, id) => {
          set((state) =>
            list === 'wishlist'
              ? { wishlist: state.wishlist.filter((item) => item.id !== id) }
              : { watched: state.watched.filter((item) => item.id !== id) },
          )
          scheduleDebouncedSync()
        },
        move: (id, to) => {
          set((state) => {
            const from = otherCollectionList(to)
            const item = state[from].find((existing) => existing.id === id)
            if (!item || state[to].some((existing) => existing.id === id)) return state
            const remaining = state[from].filter((existing) => existing.id !== id)
            const target = [...state[to], withFinishStamp(item, to)]
            return to === 'wishlist' ? { wishlist: target, watched: remaining } : { wishlist: remaining, watched: target }
          })
          scheduleDebouncedSync()
        },
        reorder: (list, orderedIds) => {
          set((state) =>
            list === 'wishlist'
              ? { wishlist: reorderItems(state.wishlist, orderedIds) }
              : { watched: reorderItems(state.watched, orderedIds) },
          )
          scheduleDebouncedSync()
        },
        updateItem: (list, id, patch) => {
          set((state) => ({
            [list]: state[list].map((item) => (item.id === id ? { ...item, ...patch } : item)),
          }))
          scheduleDebouncedSync()
        },
      }),
      { name: storageKey, storage: hybridPersistStorage, version: COLLECTION_VERSION },
    ),
  )

export type CollectionStore = ReturnType<typeof createCollectionStore>

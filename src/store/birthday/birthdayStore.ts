import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import type { BirthdayState } from '../types'

export const useBirthdayStore = create<BirthdayState>()(
  persist(
    (set) => ({
      ownBirthday: '',
      birthdays: [],
      setOwnBirthday: (date) => {
        set({ ownBirthday: date })
        scheduleDebouncedSync()
      },
      addBirthday: (name, date) => {
        set((state) => ({
          birthdays: [...state.birthdays, { id: `${Date.now()}-${name}`, name, date }],
        }))
        scheduleDebouncedSync()
      },
      removeBirthday: (id) => {
        set((state) => ({ birthdays: state.birthdays.filter((birthday) => birthday.id !== id) }))
        scheduleDebouncedSync()
      },
    }),
    { name: 'animal-birthdays', storage: hybridPersistStorage },
  ),
)

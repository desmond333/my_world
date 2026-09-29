import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BirthdayState } from '../types'

export const useBirthdayStore = create<BirthdayState>()(
  persist(
    (set) => ({
      ownBirthday: '',
      birthdays: [],
      setOwnBirthday: (date) => set({ ownBirthday: date }),
      addBirthday: (name, date) =>
        set((state) => ({
          birthdays: [...state.birthdays, { id: `${Date.now()}-${name}`, name, date }],
        })),
      removeBirthday: (id) => set((state) => ({ birthdays: state.birthdays.filter((birthday) => birthday.id !== id) })),
    }),
    { name: 'animal-birthdays' },
  ),
)

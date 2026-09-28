import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency, CurrencyRates, FinanceEntry } from '../data'
import { DEFAULT_CURRENCY, DEFAULT_RATES, isCurrency } from '../lib/finance'

const STORAGE_KEY = 'animal-finance'

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type RatesSource = 'default' | 'server' | 'manual'

export type FinanceStore = {
  entries: FinanceEntry[]
  balance: CurrencyRates
  currency: Currency
  rates: CurrencyRates
  ratesSource: RatesSource
  ratesUpdatedAt: string | null
  addEntry: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => void
  updateEntry: (id: string, patch: Partial<Omit<FinanceEntry, 'id' | 'createdAt'>>) => void
  removeEntry: (id: string) => void
  setBalance: (currency: Currency, amount: number) => void
  setCurrency: (currency: Currency) => void
  setRate: (currency: Currency, value: number) => void
  applyRates: (rates: CurrencyRates, updatedAt: string) => void
  resetRates: () => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      entries: [],
      balance: { RUB: 0, USD: 0, GEL: 0 },
      currency: DEFAULT_CURRENCY,
      rates: { ...DEFAULT_RATES },
      ratesSource: 'default',
      ratesUpdatedAt: null,
      addEntry: (entry) =>
        set((state) => {
          if (!entry.amount || entry.amount <= 0) return state
          const created: FinanceEntry = { ...entry, id: createId(), createdAt: new Date().toISOString() }
          return { entries: [...state.entries, created] }
        }),
      updateEntry: (id, patch) =>
        set((state) => ({ entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) })),
      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      setBalance: (currency, amount) =>
        set((state) => ({ balance: { ...state.balance, [currency]: Number.isFinite(amount) ? amount : 0 } })),
      setCurrency: (currency) => set((state) => (isCurrency(currency) ? { currency } : state)),
      setRate: (currency, value) =>
        set((state) => {
          if (!Number.isFinite(value) || value <= 0) return state
          return { rates: { ...state.rates, [currency]: value }, ratesSource: 'manual', ratesUpdatedAt: new Date().toISOString() }
        }),
      applyRates: (rates, updatedAt) => set({ rates, ratesSource: 'server', ratesUpdatedAt: updatedAt }),
      resetRates: () => set({ rates: { ...DEFAULT_RATES }, ratesSource: 'default', ratesUpdatedAt: null }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (state) => {
        const previous = state as Partial<FinanceStore> | undefined
        if (!previous) return state
        return { ...previous, ratesSource: previous.ratesSource ?? 'default', ratesUpdatedAt: previous.ratesUpdatedAt ?? null }
      },
    },
  ),
)

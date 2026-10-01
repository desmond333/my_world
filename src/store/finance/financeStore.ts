import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hybridPersistStorage, STORAGE_KEYS } from '../../lib/storage'
import { scheduleDebouncedSync } from '../../services/api/syncDebounce'
import type { Currency, CurrencyRates, Deposit, FinanceEntry, Loan } from '../../data'
import { DEFAULT_CURRENCY, DEFAULT_RATES, isCurrency } from '../../lib/finance'

const STORAGE_KEY = STORAGE_KEYS.finance

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export type RatesSource = 'default' | 'server' | 'manual'

export type FinanceStore = {
  entries: FinanceEntry[]
  deposits: Deposit[]
  loans: Loan[]
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
  addDeposit: (deposit: Omit<Deposit, 'id' | 'createdAt'>) => void
  updateDeposit: (id: string, patch: Partial<Omit<Deposit, 'id' | 'createdAt'>>) => void
  removeDeposit: (id: string) => void
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void
  updateLoan: (id: string, patch: Partial<Omit<Loan, 'id' | 'createdAt'>>) => void
  removeLoan: (id: string) => void
  makeLoanPayment: (id: string, paymentAmount?: number) => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      entries: [],
      deposits: [],
      loans: [],
      balance: { RUB: 0, USD: 0, GEL: 0 },
      currency: DEFAULT_CURRENCY,
      rates: { ...DEFAULT_RATES },
      ratesSource: 'default',
      ratesUpdatedAt: null,
      addEntry: (entry) => {
        set((state) => {
          if (!entry.amount || entry.amount <= 0) return state
          const created: FinanceEntry = { ...entry, id: createId(), createdAt: new Date().toISOString() }
          return { entries: [...state.entries, created] }
        })
        scheduleDebouncedSync()
      },
      updateEntry: (id, patch) => {
        set((state) => ({ entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) }))
        scheduleDebouncedSync()
      },
      removeEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }))
        scheduleDebouncedSync()
      },
      setBalance: (currency, amount) => {
        set((state) => ({ balance: { ...state.balance, [currency]: Number.isFinite(amount) ? amount : 0 } }))
        scheduleDebouncedSync()
      },
      setCurrency: (currency) => set((state) => (isCurrency(currency) ? { currency } : state)),
      setRate: (currency, value) => {
        set((state) => {
          if (!Number.isFinite(value) || value <= 0) return state
          return { rates: { ...state.rates, [currency]: value }, ratesSource: 'manual', ratesUpdatedAt: new Date().toISOString() }
        })
        scheduleDebouncedSync()
      },
      applyRates: (rates, updatedAt) => set({ rates, ratesSource: 'server', ratesUpdatedAt: updatedAt }),
      resetRates: () => set({ rates: { ...DEFAULT_RATES }, ratesSource: 'default', ratesUpdatedAt: null }),
      addDeposit: (deposit) => {
        set((state) => {
          const created: Deposit = { ...deposit, id: createId(), createdAt: new Date().toISOString() }
          return { deposits: [...state.deposits, created] }
        })
        scheduleDebouncedSync()
      },
      updateDeposit: (id, patch) => {
        set((state) => ({
          deposits: state.deposits.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }))
        scheduleDebouncedSync()
      },
      removeDeposit: (id) => {
        set((state) => ({ deposits: state.deposits.filter((item) => item.id !== id) }))
        scheduleDebouncedSync()
      },
      addLoan: (loan) => {
        set((state) => {
          const created: Loan = { ...loan, id: createId(), createdAt: new Date().toISOString() }
          return { loans: [...state.loans, created] }
        })
        scheduleDebouncedSync()
      },
      updateLoan: (id, patch) => {
        set((state) => ({
          loans: state.loans.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }))
        scheduleDebouncedSync()
      },
      removeLoan: (id) => {
        set((state) => ({ loans: state.loans.filter((item) => item.id !== id) }))
        scheduleDebouncedSync()
      },
      makeLoanPayment: (id, paymentAmount) => {
        set((state) => ({
          loans: state.loans.map((item) => {
            if (item.id !== id) return item
            const toDeduct = paymentAmount ?? item.monthlyPayment
            const newRemaining = Math.max(0, item.remainingAmount - toDeduct)
            return { ...item, remainingAmount: newRemaining }
          }),
        }))
        scheduleDebouncedSync()
      },
    }),
    {
      name: STORAGE_KEY,
      storage: hybridPersistStorage,
      version: 3,
      migrate: (state) => {
        const previous = state as Partial<FinanceStore> | undefined
        if (!previous) return state
        return {
          ...previous,
          deposits: previous.deposits ?? [],
          loans: previous.loans ?? [],
          ratesSource: previous.ratesSource ?? 'default',
          ratesUpdatedAt: previous.ratesUpdatedAt ?? null,
        }
      },
    },
  ),
)

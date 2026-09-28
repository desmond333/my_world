import type { CurrencyRates } from '../data'
import { CURRENCIES, DEFAULT_RATES } from '../lib/finance'

const RATES_URL = 'https://open.er-api.com/v6/latest/RUB'
const TIMEOUT_MS = 8000

type RatesResponse = {
  result?: string
  time_last_update_unix?: number
  rates?: Record<string, number>
}

export type RatesSnapshot = { rates: CurrencyRates; updatedAt: string }

const positive = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null)

export const fetchRates = async (signal?: AbortSignal): Promise<RatesSnapshot> => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort)

  let response: Response
  try {
    response = await fetch(RATES_URL, { headers: { Accept: 'application/json' }, signal: controller.signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Не удалось получить курсы. Проверь соединение.', { cause: error })
  } finally {
    window.clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }

  if (!response.ok) throw new Error(`Курсовой сервис ответил ошибкой ${response.status}.`)

  const data = (await response.json()) as RatesResponse
  if (data.result && data.result !== 'success') throw new Error('Курсовой сервис вернул ошибку.')

  const raw = data.rates ?? {}
  const next = { ...DEFAULT_RATES } as CurrencyRates
  CURRENCIES.forEach((currency) => {
    if (currency === 'RUB') return
    const perUnit = positive(raw[currency])
    if (perUnit) next[currency] = Number((1 / perUnit).toFixed(4))
  })

  if (next.USD === DEFAULT_RATES.USD && next.GEL === DEFAULT_RATES.GEL) {
    throw new Error('Курсовой сервис не вернул нужные валюты.')
  }

  const stamp = positive(data.time_last_update_unix)
  const updatedAt = stamp ? new Date(stamp * 1000).toISOString() : new Date().toISOString()
  return { rates: next, updatedAt }
}

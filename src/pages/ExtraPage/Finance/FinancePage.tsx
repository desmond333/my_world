import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChartNoAxesColumn, RefreshCw, RotateCcw, Wallet } from 'lucide-react'
import type { RatesSource } from '../../../store'
import {
  CURRENCIES,
  CURRENCY_MARKS,
  CURRENCY_NAMES,
  convert,
  formatMoney,
  groupByYear,
  monthKey,
  monthTotal,
  monthsWithEntries,
  rateRows,
} from '../../../lib'
import { fetchRates } from '../../../services'
import { useFinanceStore } from '../../../store'
import { MonthCard } from './MonthCard'
import './Finance.css'

const STALE_MS = 6 * 60 * 60 * 1000

const RATES_SOURCE_LABELS: Record<RatesSource, string> = {
  server: 'Курсы с сервера',
  manual: 'Курсы вручную',
  default: 'Курсы по умолчанию',
}

const formatStamp = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

const isStale = (updatedAt: string | null) => {
  if (!updatedAt) return true
  const stamp = new Date(updatedAt).getTime()
  return !Number.isFinite(stamp) || Date.now() - stamp > STALE_MS
}

export const FinancePage = () => {
  const entries = useFinanceStore((state) => state.entries)
  const balance = useFinanceStore((state) => state.balance)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const ratesSource = useFinanceStore((state) => state.ratesSource)
  const ratesUpdatedAt = useFinanceStore((state) => state.ratesUpdatedAt)
  const setBalance = useFinanceStore((state) => state.setBalance)
  const setCurrency = useFinanceStore((state) => state.setCurrency)
  const setRate = useFinanceStore((state) => state.setRate)
  const applyRates = useFinanceStore((state) => state.applyRates)
  const resetRates = useFinanceStore((state) => state.resetRates)

  const current = monthKey()
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [ratesError, setRatesError] = useState('')
  const manual = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setRatesError('')
    try {
      const snapshot = await fetchRates()
      applyRates(snapshot.rates, snapshot.updatedAt)
    } catch (error) {
      setRatesError(error instanceof Error ? error.message : 'Не удалось обновить курсы.')
    } finally {
      setLoading(false)
    }
  }, [applyRates])

  useEffect(() => {
    if (manual.current || !isStale(ratesUpdatedAt)) return
    void load()
  }, [load, ratesUpdatedAt])

  const months = useMemo(() => monthsWithEntries(entries, current), [entries, current])
  const years = useMemo(
    () => groupByYear(months, (month) => monthTotal(entries, month, currency, rates).total),
    [entries, months, currency, rates],
  )
  const visible = useMemo(
    () => (yearFilter ? months.filter((month) => month.startsWith(String(yearFilter))) : months),
    [months, yearFilter],
  )
  const ratesTable = useMemo(() => rateRows(rates), [rates])

  const totalBalance = useMemo(
    () => CURRENCIES.reduce((sum, item) => sum + convert(balance[item], item, currency, rates), 0),
    [balance, currency, rates],
  )

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Wallet size={15} /> дополнительно · финансы
        </p>
        <h1>Финансы</h1>
        <p className="intro">Поступления по месяцам в рублях, долларах и лари. Считается в рублях по умолчанию, курсы можно менять.</p>
      </section>

      <section className="finance-panel">
        <div className="finance-balance">
          <div className="finance-balance-head">
            <h2>Сейчас у меня</h2>
            <div className="entry-kinds">
              {CURRENCIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`mini-button${currency === item ? ' is-on' : ''}`}
                  onClick={() => setCurrency(item)}
                >
                  {CURRENCY_MARKS[item]}
                </button>
              ))}
            </div>
          </div>

          <label className="finance-balance-field">
            <span className="visually-hidden">Текущая сумма в {currency}</span>
            <input
              type="text"
              inputMode="decimal"
              value={String(balance[currency]).replace('.', ',')}
              onChange={(event) => {
                const parsed = Number(event.target.value.replace(',', '.').replace(/\s/g, ''))
                setBalance(currency, Number.isFinite(parsed) ? parsed : 0)
              }}
            />
            <span className="finance-balance-mark">{CURRENCY_MARKS[currency]}</span>
          </label>

          <p className="finance-balance-total">{currency === 'RUB' ? 'Сумма в рублях' : `В рублях: ${formatMoney(totalBalance, 'RUB')}`}</p>

          <div className="finance-convert">
            {CURRENCIES.filter((item) => item !== currency).map((item) => (
              <div className="finance-convert-row" key={item}>
                <span>{formatMoney(balance[currency], currency)} — это</span>
                <strong>{formatMoney(convert(balance[currency], currency, item, rates), item)}</strong>
              </div>
            ))}
          </div>

          <div className="finance-wallet">
            {CURRENCIES.map((item) => (
              <div className="finance-wallet-row" key={item}>
                <span className="finance-wallet-label">
                  {CURRENCY_MARKS[item]} {CURRENCY_NAMES[item]}
                </span>
                <span className="finance-wallet-value">
                  {item === currency ? '—' : formatMoney(convert(balance[item], item, currency, rates), currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="finance-rates">
          <div className="finance-rates-head">
            <h2>Курсы</h2>
            <div className="finance-rates-actions">
              <button type="button" className="mini-button" onClick={load} disabled={loading}>
                <RefreshCw size={14} className={loading ? 'spin' : undefined} /> {loading ? 'Обновляю' : 'Обновить'}
              </button>
              <button
                type="button"
                className="mini-button mini-button--ghost"
                onClick={() => {
                  manual.current = true
                  resetRates()
                }}
              >
                <RotateCcw size={14} /> Сбросить
              </button>
            </div>
          </div>
          <p className={`finance-rates-state${ratesError ? ' is-error' : ''}`}>
            {ratesError ||
              (ratesUpdatedAt
                ? `${RATES_SOURCE_LABELS[ratesSource]}, обновлено ${formatStamp(ratesUpdatedAt)}`
                : 'Курсы ещё не загружены с сервера.')}
          </p>
          <div className="finance-rate-inputs">
            {CURRENCIES.map((item) => (
              <label className="finance-rate-row" key={item}>
                <span>1 {CURRENCY_MARKS[item]} =</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={String(rates[item]).replace('.', ',')}
                  onChange={(event) => {
                    manual.current = true
                    const parsed = Number(event.target.value.replace(',', '.').replace(/\s/g, ''))
                    if (Number.isFinite(parsed) && parsed > 0) setRate(item, parsed)
                  }}
                />
                <span className="finance-rate-unit">₽</span>
              </label>
            ))}
          </div>
          <ul className="finance-rate-list">
            {ratesTable.slice(0, 6).map((row) => (
              <li key={`${row.from}-${row.to}`}>
                1 {CURRENCY_MARKS[row.from]} = {row.value}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="finance-years">
        <div className="finance-years-head">
          <h2>По годам</h2>
          <div className="entry-kinds">
            <button type="button" className={`mini-button${yearFilter === null ? ' is-on' : ''}`} onClick={() => setYearFilter(null)}>
              Все
            </button>
            {years.map((year) => (
              <button
                type="button"
                key={year.year}
                className={`mini-button${yearFilter === year.year ? ' is-on' : ''}`}
                onClick={() => setYearFilter(yearFilter === year.year ? null : year.year)}
              >
                {year.year}
              </button>
            ))}
          </div>
        </div>

        <div className="finance-year-grid">
          {years.map((year) => (
            <div className="finance-year-card" key={year.year}>
              <span className="finance-year-name">{year.year}</span>
              <span className="finance-year-total">{formatMoney(year.total, currency)}</span>
              <span className="finance-year-months">{year.months} мес. с поступлениями</span>
            </div>
          ))}
        </div>
      </section>

      <section className="finance-months">
        <h2>
          <ChartNoAxesColumn size={18} /> По месяцам
        </h2>
        {visible.length === 0 ? (
          <p className="finance-empty">Поступлений пока нет. Добавь первое в текущем месяце.</p>
        ) : (
          <div className="finance-month-grid">
            {visible.map((month) => (
              <MonthCard key={month} month={month} currency={currency} rates={rates} current={month === current} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

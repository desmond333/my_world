import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChartNoAxesColumn, RefreshCw, RotateCcw } from 'lucide-react'
import type { RatesSource } from '../../../../store'
import { BarChart } from '../../../../shared/ui'
import {
  CURRENCIES,
  CURRENCY_MARKS,
  currencyName,
  convert,
  formatMoney,
  groupByYear,
  monthKey,
  monthName,
  monthTotal,
  monthsWithEntries,
  rateRows,
} from '../../../../lib'
import { fetchRates } from '../../../../services'
import { countText, useTranslation } from '../../../../lib/i18n'
import { useFinanceStore, usePageViewMode } from '../../../../store'
import { MonthCard } from '../MonthCard'
import '../Finance.css'

const STALE_MS = 6 * 60 * 60 * 1000

const RATES_SOURCE_LABELS: Record<RatesSource, string> = {
  server: 'finance.rates.sourceServer',
  manual: 'finance.rates.sourceManual',
  default: 'finance.rates.sourceDefault',
}

const formatStamp = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

const isStale = (updatedAt: string | null) => {
  if (!updatedAt) return true
  const stamp = new Date(updatedAt).getTime()
  return !Number.isFinite(stamp) || Date.now() - stamp > STALE_MS
}

export const FinanceOperationsTab = () => {
  const { lang, t, locale } = useTranslation()
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
  const hasCheckedRates = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setRatesError('')
    try {
      const snapshot = await fetchRates()
      applyRates(snapshot.rates, snapshot.updatedAt)
    } catch (error) {
      setRatesError(error instanceof Error ? error.message : t('finance.rates.failed'))
    } finally {
      setLoading(false)
    }
  }, [applyRates, t])

  useEffect(() => {
    if (hasCheckedRates.current) return
    hasCheckedRates.current = true
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
  const ratesTable = useMemo(() => rateRows(rates, lang), [rates, lang])

  const totalBalance = useMemo(
    () => CURRENCIES.reduce((sum, item) => sum + convert(balance[item], item, currency, rates), 0),
    [balance, currency, rates],
  )

  const chartData = useMemo(() => {
    return [...visible]
      .reverse()
      .slice(-12)
      .map((month) => {
        const total = monthTotal(entries, month, currency, rates)
        return {
          id: month,
          label: monthName(month, locale).slice(0, 3),
          value: Math.max(0, Math.round(total.total)),
          subLabel: formatMoney(total.total, currency, lang),
          color: month === current ? 'var(--accent)' : 'rgba(244, 184, 73, 0.55)',
        }
      })
  }, [visible, entries, currency, rates, locale, lang, current])

  const { isNormal } = usePageViewMode('finance')

  return (
    <>
      <section className="finance-panel">
        <div className="finance-balance">
          <div className="finance-balance-head">
            <h2>{t('finance.balance.title')}</h2>
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
            <span className="visually-hidden">{t('finance.balance.aria', undefined, { currency })}</span>
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

          <p className="finance-balance-total">
            {currency === 'RUB'
              ? t('finance.balance.roubles')
              : t('finance.balance.inRoubles', undefined, { sum: formatMoney(totalBalance, 'RUB', lang) })}
          </p>

          <div className="finance-convert">
            {CURRENCIES.filter((item) => item !== currency).map((item) => (
              <div className="finance-convert-row" key={item}>
                <span>{t('finance.balance.means', undefined, { sum: formatMoney(balance[currency], currency, lang) })}</span>
                <strong>{formatMoney(convert(balance[currency], currency, item, rates), item, lang)}</strong>
              </div>
            ))}
          </div>

          <div className="finance-wallet">
            {CURRENCIES.map((item) => (
              <div className="finance-wallet-row" key={item}>
                <span className="finance-wallet-label">
                  {CURRENCY_MARKS[item]} {currencyName(item, lang)}
                </span>
                <span className="finance-wallet-value">
                  {item === currency ? '—' : formatMoney(convert(balance[item], item, currency, rates), currency, lang)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isNormal && (
          <div className="finance-rates">
            <div className="finance-rates-head">
              <h2>{t('finance.rates.title')}</h2>
              <div className="finance-rates-actions">
                <button type="button" className="mini-button" onClick={load} disabled={loading}>
                  <RefreshCw size={14} className={loading ? 'spin' : undefined} />{' '}
                  {loading ? t('finance.rates.refreshing') : t('finance.rates.refresh')}
                </button>
                <button
                  type="button"
                  className="mini-button mini-button--ghost"
                  onClick={() => {
                    manual.current = true
                    resetRates()
                  }}
                >
                  <RotateCcw size={14} /> {t('finance.rates.reset')}
                </button>
              </div>
            </div>
            <p className={`finance-rates-state${ratesError ? ' is-error' : ''}`}>
              {ratesError ||
                (ratesUpdatedAt
                  ? t('finance.rates.updated', undefined, {
                      source: t(RATES_SOURCE_LABELS[ratesSource]),
                      stamp: formatStamp(ratesUpdatedAt, locale),
                    })
                  : t('finance.rates.empty'))}
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
        )}
      </section>

      {isNormal && (
        <section className="finance-years">
          <div className="finance-years-head">
            <h2>{t('finance.years.title')}</h2>
            <div className="entry-kinds">
              <button type="button" className={`mini-button${yearFilter === null ? ' is-on' : ''}`} onClick={() => setYearFilter(null)}>
                {t('common.all')}
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
                <span className="finance-year-total">{formatMoney(year.total, currency, lang)}</span>
                <span className="finance-year-months">{countText('finance.years.month', year.months, lang)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="finance-months">
        <h2>
          <ChartNoAxesColumn size={18} /> {t('finance.months.title')}
        </h2>
        {isNormal && chartData.length > 1 && (
          <div className="finance-chart-wrapper">
            <BarChart
              data={chartData}
              height={170}
              formatValue={(val) =>
                val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val / 1000)}k` : String(val)
              }
            />
          </div>
        )}
        {visible.length === 0 ? (
          <p className="finance-empty">{t('finance.empty')}</p>
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

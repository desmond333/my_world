import { useMemo, useState } from 'react'
import { AlertCircle, CalendarClock, Check, Clock, CreditCard, Plus, RotateCcw, Sparkles, Trash2, Wallet } from 'lucide-react'
import { useToday } from '../../../../hooks'
import type { Currency, SubscriptionPeriod } from '../../../../data'
import { CURRENCY_MARKS, formatShortDate } from '../../../../lib'
import { useTranslation } from '../../../../lib/i18n'
import {
  SUBSCRIPTION_PERIODS,
  leftLabel,
  leftText,
  periodLabel,
  priceText,
  statusLabel,
  subscriptionSummary,
} from '../../../../lib/subscriptions'
import { useFinanceStore, useSubscriptionStore } from '../../../../store'
import { ToggleGroup, ToggleGroupItem } from '../../../../shared/ui'
import './SubscriptionsPage.css'

const CURRENCIES: Currency[] = ['RUB', 'USD', 'GEL']

const POPULAR_PRESETS = [
  { name: 'Яндекс Плюс', price: '299', cur: 'RUB' as Currency, period: 'month' as SubscriptionPeriod },
  { name: 'Telegram Premium', price: '299', cur: 'RUB' as Currency, period: 'month' as SubscriptionPeriod },
  { name: 'VK Музыка', price: '169', cur: 'RUB' as Currency, period: 'month' as SubscriptionPeriod },
  { name: 'iCloud 50 ГБ', price: '99', cur: 'RUB' as Currency, period: 'month' as SubscriptionPeriod },
  { name: 'ChatGPT Plus', price: '20', cur: 'USD' as Currency, period: 'month' as SubscriptionPeriod },
]

const previousDay = (key: string) => {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export type SubFilter = 'all' | 'active' | 'soon' | 'stopped'

export const SubscriptionsPage = ({ hideHeader = false }: { hideHeader?: boolean } = {}) => {
  const { lang, t, locale } = useTranslation()
  const items = useSubscriptionStore((state) => state.items)
  const add = useSubscriptionStore((state) => state.add)
  const update = useSubscriptionStore((state) => state.update)
  const remove = useSubscriptionStore((state) => state.remove)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const { today } = useToday()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cur, setCur] = useState<Currency>('RUB')
  const [period, setPeriod] = useState<SubscriptionPeriod>('month')
  const [startedAt, setStartedAt] = useState(today)
  const [until, setUntil] = useState('')
  const [filter, setFilter] = useState<SubFilter>('all')

  const summary = useMemo(() => subscriptionSummary(items, today, currency, rates, lang), [items, today, currency, rates, lang])
  const { monthTotal, activeCount, closest, views } = summary

  const sorted = useMemo(() => {
    return [...views].sort((first, second) => {
      if (first.status === 'stopped' && second.status !== 'stopped') return 1
      if (second.status === 'stopped' && first.status !== 'stopped') return -1
      return first.daysLeft - second.daysLeft
    })
  }, [views])

  const soonCount = useMemo(() => sorted.filter((v) => v.status === 'soon' || v.status === 'today').length, [sorted])
  const stoppedCount = useMemo(() => sorted.filter((v) => v.status === 'stopped' || v.status === 'over').length, [sorted])

  const filtered = useMemo(() => {
    return sorted.filter((view) => {
      if (filter === 'active') return view.status !== 'stopped' && view.status !== 'over'
      if (filter === 'soon') return view.status === 'soon' || view.status === 'today'
      if (filter === 'stopped') return view.status === 'stopped' || view.status === 'over'
      return true
    })
  }, [sorted, filter])

  const submit = () => {
    const value = Number(price.replace(',', '.'))
    if (!name.trim() || !Number.isFinite(value) || value <= 0) return
    add({ name: name.trim(), price: value, currency: cur, period, startedAt, until, note: '' })
    setName('')
    setPrice('')
    setUntil('')
  }

  const applyPreset = (preset: (typeof POPULAR_PRESETS)[number]) => {
    setName(preset.name)
    setPrice(preset.price)
    setCur(preset.cur)
    setPeriod(preset.period)
    if (!startedAt) setStartedAt(today)
  }

  const renew = (id: string, from: string) => update(id, { startedAt: from, until: '' })

  return (
    <div className="subs-page">
      {!hideHeader && (
        <header className="useful-head">
          <p className="eyebrow">
            <Wallet size={15} /> {t('subs.kicker')}
          </p>
          <h1>{t('subs.title')}</h1>
          <p className="intro">{t('subs.intro')}</p>
        </header>
      )}

      <section className="subs-stats-grid">
        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <CreditCard size={14} /> {t('subs.stat.monthly')}
          </span>
          <strong className="subs-stat-value">
            {monthTotal > 0 ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(monthTotal) : '0'}{' '}
            <span>{CURRENCY_MARKS[currency]}</span>
          </strong>
          <span className="subs-stat-sub">{t('subs.stat.rate')}</span>
        </div>

        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <Wallet size={14} /> {t('subs.stat.active')}
          </span>
          <strong className="subs-stat-value is-accent">{activeCount}</strong>
          <span className="subs-stat-sub">
            {soonCount > 0 ? t('subs.stat.soon', undefined, { count: soonCount }) : t('subs.stat.underControl')}
          </span>
        </div>

        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <Clock size={14} /> {t('subs.stat.nextBill')}
          </span>
          {closest ? (
            <>
              <strong className="subs-stat-value is-closest">{closest.sub.name}</strong>
              <span className={`subs-stat-tag${closest.daysLeft <= 3 ? ' is-alert' : ''}`}>
                {leftLabel(closest.daysLeft, lang)} · {formatShortDate(closest.deadline, locale)}
              </span>
            </>
          ) : (
            <>
              <strong className="subs-stat-value">—</strong>
              <span className="subs-stat-sub">{t('subs.stat.noCharges')}</span>
            </>
          )}
        </div>
      </section>

      <section className="subs-form-panel">
        <div className="subs-form-head">
          <h2>
            <Plus size={18} /> {t('subs.form.title')}
          </h2>
          <span className="subs-form-tip">{t('subs.form.tip')}</span>
        </div>

        <form
          className="subs-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="subs-form-presets">
            <span className="subs-presets-label">{t('subs.form.presets')}</span>
            <div className="subs-presets-list">
              {POPULAR_PRESETS.map((preset) => (
                <button key={preset.name} type="button" className="subs-preset-pill" onClick={() => applyPreset(preset)}>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="subs-form-row">
            <label className="subs-field-name">
              <span className="subs-label-text">{t('subs.form.name')}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('subs.form.namePlaceholder')}
                autoComplete="off"
              />
            </label>

            <div className="subs-price-group">
              <label className="subs-field-price">
                <span className="subs-label-text">{t('subs.form.price')}</span>
                <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="299" />
              </label>

              <ToggleGroup
                type="single"
                value={cur}
                onValueChange={(value) => {
                  if (value) setCur(value as Currency)
                }}
                className="subs-currency-pills"
                aria-label={t('subs.form.price')}
              >
                {CURRENCIES.map((value) => (
                  <ToggleGroupItem key={value} value={value} className="subs-cur-btn">
                    {CURRENCY_MARKS[value]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="subs-form-row subs-form-secondary">
            <div className="subs-period-group">
              <span className="subs-label-text">{t('subs.form.period')}</span>
              <ToggleGroup
                type="single"
                value={period}
                onValueChange={(value) => {
                  if (value) setPeriod(value as SubscriptionPeriod)
                }}
                className="subs-period-pills"
                aria-label={t('subs.form.period')}
              >
                {SUBSCRIPTION_PERIODS.map((value) => (
                  <ToggleGroupItem key={value} value={value} className="subs-period-btn">
                    {periodLabel(value, lang)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="subs-date-group">
              <label className="subs-field-date">
                <span className="subs-label-text">{t('subs.form.firstBill')}</span>
                <div className="subs-date-inline">
                  <input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} />
                  <button
                    type="button"
                    className={`subs-date-chip${startedAt === today ? ' is-on' : ''}`}
                    onClick={() => setStartedAt(today)}
                  >
                    {t('subs.form.today')}
                  </button>
                </div>
              </label>

              <label className="subs-field-date">
                <span className="subs-label-text">{t('subs.form.useUntil')}</span>
                <div className="subs-date-inline">
                  <input type="date" value={until} onChange={(event) => setUntil(event.target.value)} />
                  {until && (
                    <button type="button" className="subs-date-chip is-clear" onClick={() => setUntil('')}>
                      {t('subs.form.reset')}
                    </button>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="subs-form-action">
            <button
              className="subs-submit-button"
              type="submit"
              disabled={!name.trim() || !Number.isFinite(Number(price.replace(',', '.'))) || Number(price.replace(',', '.')) <= 0}
            >
              <Plus size={16} /> {t('subs.add')}
            </button>
          </div>
        </form>
      </section>

      {sorted.length > 0 && (
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(next) => {
            if (next) setFilter(next as SubFilter)
          }}
          className="subs-filters"
          aria-label={t('subs.filter.all')}
        >
          <ToggleGroupItem value="all" className="subs-filter-btn">
            {t('subs.filter.all')} ({sorted.length})
          </ToggleGroupItem>
          <ToggleGroupItem value="active" className="subs-filter-btn">
            {t('subs.filter.active')} ({activeCount})
          </ToggleGroupItem>
          {soonCount > 0 && (
            <ToggleGroupItem value="soon" className="subs-filter-btn is-alert">
              {t('subs.filter.soon')} ({soonCount})
            </ToggleGroupItem>
          )}
          {stoppedCount > 0 && (
            <ToggleGroupItem value="stopped" className="subs-filter-btn">
              {t('subs.filter.canceled')} ({stoppedCount})
            </ToggleGroupItem>
          )}
        </ToggleGroup>
      )}

      {sorted.length === 0 ? (
        <div className="subs-empty-card">
          <Sparkles size={32} className="subs-empty-icon" />
          <h2>{t('subs.empty.title')}</h2>
          <p>{t('subs.empty.note')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="subs-empty-card">
          <Check size={32} className="subs-empty-icon" />
          <p>{t('subs.empty.category')}</p>
        </div>
      ) : (
        <div className="subs-cards-list">
          {filtered.map((view) => {
            const { sub, status, daysLeft } = view
            const isSoon = status === 'soon' || status === 'today'
            const initial = sub.name.trim().charAt(0).toUpperCase()

            return (
              <article key={sub.id} className={`sub-card is-${status}`}>
                <div className="sub-card-top">
                  <div className="sub-avatar" aria-hidden="true">
                    {initial}
                  </div>

                  <div className="sub-info">
                    <div className="sub-title-row">
                      <h3 className="sub-name">{sub.name}</h3>
                      <span className={`sub-badge is-${status}`}>{statusLabel(status, lang)}</span>
                    </div>

                    <p className="sub-price">{priceText(sub, lang)}</p>

                    <p className="sub-schedule">
                      <CalendarClock size={13} /> {view.note}
                    </p>
                  </div>

                  <div className="sub-countdown">
                    <strong className={`sub-countdown-val${isSoon ? ' is-alert' : ''}`}>
                      {isSoon && <AlertCircle size={15} />}
                      {leftText(daysLeft, lang)}
                    </strong>
                    <span className="sub-deadline">{formatShortDate(view.deadline, locale)}</span>
                  </div>
                </div>

                <div className="sub-card-actions">
                  {!sub.until && (
                    <>
                      <button
                        className="sub-action-btn is-renew"
                        type="button"
                        onClick={() => renew(sub.id, view.charge)}
                        title={t('subs.action.paidTitle')}
                      >
                        <Check size={14} /> {t('subs.action.paid')}
                      </button>
                      <button
                        className="sub-action-btn is-cancel"
                        type="button"
                        onClick={() => update(sub.id, { until: previousDay(view.charge) })}
                        title={t('subs.action.cancelTitle')}
                      >
                        {t('subs.action.cancel')}
                      </button>
                    </>
                  )}
                  {sub.until && (
                    <button
                      className="sub-action-btn is-resume"
                      type="button"
                      onClick={() => update(sub.id, { until: '' })}
                      title={t('subs.action.resumeTitle')}
                    >
                      <RotateCcw size={14} /> {t('subs.action.resume')}
                    </button>
                  )}
                  <button className="sub-action-btn is-delete" type="button" onClick={() => remove(sub.id)} title={t('subs.action.delete')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <footer className="subs-footer-note">
        <p>{t('subs.footer.note')}</p>
      </footer>
    </div>
  )
}

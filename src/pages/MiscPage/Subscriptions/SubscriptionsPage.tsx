import { useMemo, useState } from 'react'
import { AlertCircle, CalendarClock, Check, Clock, CreditCard, Plus, RotateCcw, Sparkles, Trash2, Wallet } from 'lucide-react'
import type { Currency, SubscriptionPeriod } from '../../../data'
import { findCity } from '../../../data'
import { CURRENCY_MARKS, formatShortDate } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import {
  PERIOD_LABELS,
  SUBSCRIPTION_PERIODS,
  leftLabel,
  leftText,
  priceText,
  statusLabel,
  subscriptionSummary,
} from '../../../lib/subscriptions'
import { getDateForTimezone, useDailyStore, useFinanceStore, useSubscriptionStore } from '../../../store'
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

export const SubscriptionsPage = () => {
  const { lang, t } = useTranslation()
  const items = useSubscriptionStore((state) => state.items)
  const add = useSubscriptionStore((state) => state.add)
  const update = useSubscriptionStore((state) => state.update)
  const remove = useSubscriptionStore((state) => state.remove)
  const cityId = useDailyStore((state) => state.cityId)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const today = getDateForTimezone(findCity(cityId).timezone)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cur, setCur] = useState<Currency>('RUB')
  const [period, setPeriod] = useState<SubscriptionPeriod>('month')
  const [startedAt, setStartedAt] = useState(today)
  const [until, setUntil] = useState('')
  const [filter, setFilter] = useState<SubFilter>('all')

  const summary = useMemo(() => subscriptionSummary(items, today, currency, rates), [items, today, currency, rates])
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
      <header className="extra-head">
        <p className="eyebrow">
          <Wallet size={15} /> {lang === 'en' ? 'misc · subscriptions' : 'разное · подписки'}
        </p>
        <h1>{t('sub.title')}</h1>
        <p className="intro">
          {lang === 'en'
            ? 'Convenient tracking of recurring charges. See upcoming dates and amounts with automatic billing cycle rollforward.'
            : 'Удобный контроль регулярных списаний. Видно, когда и сколько снимут, а при отмене сервис помнит оплаченный период.'}
        </p>
      </header>

      {/* Stats Cards */}
      <section className="subs-stats-grid">
        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <CreditCard size={14} /> {lang === 'en' ? 'Monthly expenses' : 'Расходы в месяц'}
          </span>
          <strong className="subs-stat-value">
            {monthTotal > 0
              ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: 0 }).format(monthTotal)
              : '0'}{' '}
            <span>{CURRENCY_MARKS[currency]}</span>
          </strong>
          <span className="subs-stat-sub">{lang === 'en' ? 'at today’s exchange rate' : 'по курсу на сегодня'}</span>
        </div>

        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <Wallet size={14} /> {lang === 'en' ? 'Active subscriptions' : 'Активных сервисов'}
          </span>
          <strong className="subs-stat-value is-accent">{activeCount}</strong>
          <span className="subs-stat-sub">
            {soonCount > 0
              ? lang === 'en'
                ? `⚠️ ${soonCount} billing soon`
                : `⚠️ ${soonCount} со скорым списанием`
              : lang === 'en'
                ? 'all under control'
                : 'все под контролем'}
          </span>
        </div>

        <div className="subs-stat-card">
          <span className="subs-stat-label">
            <Clock size={14} /> {lang === 'en' ? 'Next bill' : 'Ближайший счёт'}
          </span>
          {closest ? (
            <>
              <strong className="subs-stat-value is-closest">{closest.sub.name}</strong>
              <span className={`subs-stat-tag${closest.daysLeft <= 3 ? ' is-alert' : ''}`}>
                {leftLabel(closest.daysLeft, lang)} · {formatShortDate(closest.deadline, lang === 'en' ? 'en-US' : 'ru-RU')}
              </span>
            </>
          ) : (
            <>
              <strong className="subs-stat-value">—</strong>
              <span className="subs-stat-sub">{lang === 'en' ? 'no scheduled charges' : 'нет запланированных списаний'}</span>
            </>
          )}
        </div>
      </section>

      {/* Add Subscription Form */}
      <section className="subs-form-panel">
        <div className="subs-form-head">
          <h2>
            <Plus size={18} /> Новая подписка
          </h2>
          <span className="subs-form-tip">Добавь сервис, чтобы не пропустить дату списания</span>
        </div>

        <form
          className="subs-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="subs-form-presets">
            <span className="subs-presets-label">Быстрый выбор:</span>
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
              <span className="subs-label-text">Название сервиса</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например, Яндекс Плюс, Netflix, Telegram"
                autoComplete="off"
              />
            </label>

            <div className="subs-price-group">
              <label className="subs-field-price">
                <span className="subs-label-text">Стоимость</span>
                <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="299" />
              </label>

              <div className="subs-currency-pills">
                {CURRENCIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`subs-cur-btn${cur === value ? ' is-on' : ''}`}
                    onClick={() => setCur(value)}
                  >
                    {CURRENCY_MARKS[value]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="subs-form-row subs-form-secondary">
            <div className="subs-period-group">
              <span className="subs-label-text">Период списания</span>
              <div className="subs-period-pills">
                {SUBSCRIPTION_PERIODS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`subs-period-btn${period === value ? ' is-on' : ''}`}
                    onClick={() => setPeriod(value)}
                  >
                    {PERIOD_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="subs-date-group">
              <label className="subs-field-date">
                <span className="subs-label-text">Первый счёт (дата)</span>
                <div className="subs-date-inline">
                  <input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} />
                  <button
                    type="button"
                    className={`subs-date-chip${startedAt === today ? ' is-on' : ''}`}
                    onClick={() => setStartedAt(today)}
                  >
                    Сегодня
                  </button>
                </div>
              </label>

              <label className="subs-field-date">
                <span className="subs-label-text">Пользоваться до (если отменяешь)</span>
                <div className="subs-date-inline">
                  <input type="date" value={until} onChange={(event) => setUntil(event.target.value)} />
                  {until && (
                    <button type="button" className="subs-date-chip is-clear" onClick={() => setUntil('')}>
                      Сброс
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
              <Plus size={16} /> Добавить подписку
            </button>
          </div>
        </form>
      </section>

      {/* Filter Tabs */}
      {sorted.length > 0 && (
        <div className="subs-filters">
          <button type="button" className={`subs-filter-btn${filter === 'all' ? ' is-on' : ''}`} onClick={() => setFilter('all')}>
            {lang === 'en' ? 'All' : 'Все'} ({sorted.length})
          </button>
          <button type="button" className={`subs-filter-btn${filter === 'active' ? ' is-on' : ''}`} onClick={() => setFilter('active')}>
            {lang === 'en' ? 'Active' : 'Активные'} ({activeCount})
          </button>
          {soonCount > 0 && (
            <button
              type="button"
              className={`subs-filter-btn is-alert${filter === 'soon' ? ' is-on' : ''}`}
              onClick={() => setFilter('soon')}
            >
              {lang === 'en' ? 'Due soon' : 'Скоро счёт'} ({soonCount})
            </button>
          )}
          {stoppedCount > 0 && (
            <button type="button" className={`subs-filter-btn${filter === 'stopped' ? ' is-on' : ''}`} onClick={() => setFilter('stopped')}>
              {lang === 'en' ? 'Canceled' : 'Отменённые'} ({stoppedCount})
            </button>
          )}
        </div>
      )}

      {/* Subscriptions List */}
      {sorted.length === 0 ? (
        <div className="subs-empty-card">
          <Sparkles size={32} className="subs-empty-icon" />
          <h2>{lang === 'en' ? 'No subscriptions yet' : 'Подписок пока нет'}</h2>
          <p>
            {lang === 'en'
              ? 'Add your services above or select a popular preset (Telegram Premium, iCloud, etc.) to start tracking billing dates.'
              : 'Добавь свои сервисы выше или нажми на быстрый выбор (Яндекс Плюс, Telegram Premium и др.), чтобы сразу видеть даты следующих списаний.'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="subs-empty-card">
          <Check size={32} className="subs-empty-icon" />
          <p>{lang === 'en' ? 'No services in this category.' : 'В этой категории сейчас нет сервисов.'}</p>
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
                    <span className="sub-deadline">{formatShortDate(view.deadline, lang === 'en' ? 'en-US' : 'ru-RU')}</span>
                  </div>
                </div>

                <div className="sub-card-actions">
                  {!sub.until && (
                    <>
                      <button
                        className="sub-action-btn is-renew"
                        type="button"
                        onClick={() => renew(sub.id, view.charge)}
                        title={lang === 'en' ? 'Mark as paid and advance cycle' : 'Подтвердить оплату и сдвинуть на следующий цикл'}
                      >
                        <Check size={14} /> {lang === 'en' ? 'Paid' : 'Оплачено'}
                      </button>
                      <button
                        className="sub-action-btn is-cancel"
                        type="button"
                        onClick={() => update(sub.id, { until: previousDay(view.charge) })}
                        title={
                          lang === 'en' ? 'Cancel subscription before next bill' : 'Поставить окончание за 1 день до следующего списания'
                        }
                      >
                        {lang === 'en' ? 'Cancel subscription' : 'Отменить подписку'}
                      </button>
                    </>
                  )}
                  {sub.until && (
                    <button
                      className="sub-action-btn is-resume"
                      type="button"
                      onClick={() => update(sub.id, { until: '' })}
                      title={lang === 'en' ? 'Resume active subscription' : 'Вернуть подписку в активные'}
                    >
                      <RotateCcw size={14} /> {lang === 'en' ? 'Resume' : 'Возобновить'}
                    </button>
                  )}
                  <button
                    className="sub-action-btn is-delete"
                    type="button"
                    onClick={() => remove(sub.id)}
                    title={lang === 'en' ? 'Delete subscription' : 'Удалить подписку из списка'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <footer className="subs-footer-note">
        <p>
          💡 <strong>Как это работает:</strong> даты рассчитываются автоматически от первого счёта по выбранному периоду. Кнопка «Отменить
          подписку» устанавливает дату окончания на день раньше списания, чтобы напомнить отключить автоплатёж вовремя.
        </p>
      </footer>
    </div>
  )
}

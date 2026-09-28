import { useState } from 'react'
import { CalendarClock, Check, Plus, Trash2, Wallet } from 'lucide-react'
import type { Currency, SubscriptionPeriod } from '../../../data'
import { findCity } from '../../../data'
import { CURRENCY_MARKS, formatShortDate } from '../../../lib'
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

const previousDay = (key: string) => {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export const SubscriptionsPage = () => {
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

  const { monthTotal, activeCount, closest, views } = subscriptionSummary(items, today, currency, rates)
  const sorted = [...views].sort((first, second) => {
    if (first.status === 'stopped' && second.status !== 'stopped') return 1
    if (second.status === 'stopped' && first.status !== 'stopped') return -1
    return first.daysLeft - second.daysLeft
  })

  const submit = () => {
    const value = Number(price.replace(',', '.'))
    if (!name.trim() || !Number.isFinite(value) || value <= 0) return
    add({ name: name.trim(), price: value, currency: cur, period, startedAt, until, note: '' })
    setName('')
    setPrice('')
  }

  const renew = (id: string, from: string) => update(id, { startedAt: from, until: '' })

  return (
    <div className="subs">
      <header className="extra-head">
        <p className="card-kicker">
          <Wallet size={14} /> раздел дополнительно
        </p>
        <h1>Подписки</h1>
        <p className="intro">
          Запиши, когда снимают деньги. Списание видно заранее, а если подписку отменяешь — последний день, когда ещё можно пользоваться.
        </p>
      </header>

      <section className="subs-stats">
        <div className="subs-stat">
          <span className="subs-stat-label">в месяц</span>
          <strong>
            {monthTotal > 0 ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(monthTotal) : '—'}{' '}
            {CURRENCY_MARKS[currency]}
          </strong>
        </div>
        <div className="subs-stat">
          <span className="subs-stat-label">платных</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="subs-stat">
          <span className="subs-stat-label">ближайшее</span>
          <strong>{closest ? `${closest.sub.name} · ${leftLabel(closest.daysLeft)}` : '—'}</strong>
        </div>
      </section>

      <section className="panel">
        <form
          className="entry-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="entry-grid">
            <label>
              <span>Подписка</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="например, музыка" />
            </label>
            <label>
              <span>Цена</span>
              <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="0" />
            </label>
            <label>
              <span>Первый счёт</span>
              <input type="date" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} />
            </label>
            <label>
              <span>Пользоваться до</span>
              <input type="date" value={until} onChange={(event) => setUntil(event.target.value)} />
            </label>
          </div>

          <div className="entry-row">
            <div className="mini-buttons">
              {CURRENCIES.map((value) => (
                <button key={value} type="button" className={`mini-button${cur === value ? ' is-on' : ''}`} onClick={() => setCur(value)}>
                  {CURRENCY_MARKS[value]}
                </button>
              ))}
            </div>
            <div className="mini-buttons">
              {SUBSCRIPTION_PERIODS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`mini-button${period === value ? ' is-on' : ''}`}
                  onClick={() => setPeriod(value)}
                >
                  {PERIOD_LABELS[value]}
                </button>
              ))}
            </div>
            <button className="add-button" type="submit">
              <Plus size={16} /> добавить
            </button>
          </div>
        </form>
      </section>

      {sorted.length === 0 ? (
        <section className="favorites-empty">
          <h2>Подписок пока нет</h2>
          <p>Добавь первую — и сразу увидишь, когда планируется списание.</p>
        </section>
      ) : (
        <ul className="subs-list">
          {sorted.map((view) => {
            const { sub, status, daysLeft } = view
            return (
              <li key={sub.id} className={`subs-item is-${status}`}>
                <div className="subs-main">
                  <div className="subs-title">
                    <h3>{sub.name}</h3>
                    <span className={`subs-badge is-${status}`}>{statusLabel(status)}</span>
                  </div>
                  <p className="subs-price">{priceText(sub)}</p>
                  <p className="subs-note">
                    <CalendarClock size={14} /> {view.note}
                  </p>
                </div>

                <div className="subs-side">
                  <strong className={`subs-left${status === 'soon' || status === 'today' ? ' is-alert' : ''}`}>{leftText(daysLeft)}</strong>
                  <span className="subs-date">{formatShortDate(view.deadline)}</span>
                </div>

                <div className="subs-actions">
                  {!sub.until && (
                    <>
                      <button className="more-button" type="button" onClick={() => renew(sub.id, view.charge)}>
                        <Check size={14} /> оплачено
                      </button>
                      <button className="more-button" type="button" onClick={() => update(sub.id, { until: previousDay(view.charge) })}>
                        отменить
                      </button>
                    </>
                  )}
                  <button className="more-button" type="button" onClick={() => update(sub.id, { until: '' })} disabled={!sub.until}>
                    возобновить
                  </button>
                  <button className="more-button" type="button" onClick={() => remove(sub.id)}>
                    <Trash2 size={14} /> удалить
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="subs-footnote">
        Даты считаются от первого счёта по выбранному периоду. «Отменить» ставит последний день пользования за день до списания, чтобы
        успеть отписаться.
      </p>
    </div>
  )
}

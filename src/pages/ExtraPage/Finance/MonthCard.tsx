import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Currency } from '../../../data'
import { financeKindLabel, formatConverted, formatMoney, monthName, monthTotal } from '../../../lib'
import { countText, useTranslation } from '../../../lib/i18n'
import { useFinanceStore } from '../../../store'
import { EntryForm } from './EntryForm'

export type MonthCardProps = {
  month: string
  currency: Currency
  rates: Record<Currency, number>
  current: boolean
}

export const MonthCard = ({ month, currency, rates, current }: MonthCardProps) => {
  const { lang, t, locale } = useTranslation()
  const entries = useFinanceStore((state) => state.entries)
  const removeEntry = useFinanceStore((state) => state.removeEntry)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const total = monthTotal(entries, month, currency, rates)
  const own = entries.filter((entry) => entry.month === month)
  const editing = own.find((entry) => entry.id === editId) ?? null

  return (
    <article className={`finance-month${current ? ' is-current' : ''}`}>
      <header className="finance-month-head">
        <h3>
          {monthName(month, locale)}
          {current && <em>{t('finance.month.current')}</em>}
        </h3>
        <p className="finance-month-total">{formatMoney(total.total, currency, lang)}</p>
      </header>

      <dl className="finance-month-split">
        <div>
          <dt>{t('finance.month.salary')}</dt>
          <dd>{formatMoney(total.salary, currency, lang)}</dd>
        </div>
        <div>
          <dt>{t('finance.month.oneoff')}</dt>
          <dd>{formatMoney(total.oneoff, currency, lang)}</dd>
        </div>
      </dl>

      {own.length > 0 ? (
        <ul className="finance-entries">
          {own.map((entry) => (
            <li className="finance-entry" key={entry.id}>
              <div className="finance-entry-main">
                <span className="finance-entry-kind">{financeKindLabel(entry.kind, lang)}</span>
                <span className="finance-entry-amount">
                  {formatMoney(entry.amount, entry.currency, lang)}
                  {entry.currency !== currency && <em>≈ {formatConverted(entry.amount, entry.currency, currency, rates, lang)}</em>}
                </span>
                {entry.note && <span className="finance-entry-note">{entry.note}</span>}
              </div>
              <div className="finance-entry-actions">
                <button
                  type="button"
                  className="icon-button"
                  title={t('finance.entry.edit')}
                  onClick={() => {
                    setAdding(false)
                    setEditId(entry.id)
                  }}
                >
                  <Pencil size={15} />
                  <span className="visually-hidden">
                    {t('finance.entry.editAria', undefined, { name: entry.note || financeKindLabel(entry.kind, lang) })}
                  </span>
                </button>
                <button type="button" className="icon-button" title={t('finance.entry.delete')} onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={15} />
                  <span className="visually-hidden">{t('finance.entry.deleteAria')}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="finance-empty">{t('finance.month.empty')}</p>
      )}

      {editing ? (
        <EntryForm
          month={month}
          entry={editing}
          onDone={() => {
            setEditId(null)
            setAdding(false)
          }}
        />
      ) : adding ? (
        <EntryForm month={month} entry={null} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="mini-button" onClick={() => setAdding(true)}>
          <Plus size={15} /> {t('finance.month.addEntry')}
        </button>
      )}

      {total.count > 0 && <p className="finance-month-count">{countText('finance.month.count', total.count, lang)}</p>}
    </article>
  )
}

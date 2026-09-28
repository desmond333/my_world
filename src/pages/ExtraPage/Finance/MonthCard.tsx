import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Currency } from '../../../data'
import { FINANCE_LABELS, formatConverted, formatMoney, monthName, monthTotal, withCount } from '../../../lib'
import { useFinanceStore } from '../../../store'
import { EntryForm } from './EntryForm'

export type MonthCardProps = {
  month: string
  currency: Currency
  rates: Record<Currency, number>
  current: boolean
}

export const MonthCard = ({ month, currency, rates, current }: MonthCardProps) => {
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
          {monthName(month)}
          {current && <em>текущий</em>}
        </h3>
        <p className="finance-month-total">{formatMoney(total.total, currency)}</p>
      </header>

      <dl className="finance-month-split">
        <div>
          <dt>Зарплата</dt>
          <dd>{formatMoney(total.salary, currency)}</dd>
        </div>
        <div>
          <dt>Разовое</dt>
          <dd>{formatMoney(total.oneoff, currency)}</dd>
        </div>
      </dl>

      {own.length > 0 ? (
        <ul className="finance-entries">
          {own.map((entry) => (
            <li className="finance-entry" key={entry.id}>
              <div className="finance-entry-main">
                <span className="finance-entry-kind">{FINANCE_LABELS[entry.kind]}</span>
                <span className="finance-entry-amount">
                  {formatMoney(entry.amount, entry.currency)}
                  {entry.currency !== currency && <em>≈ {formatConverted(entry.amount, entry.currency, currency, rates)}</em>}
                </span>
                {entry.note && <span className="finance-entry-note">{entry.note}</span>}
              </div>
              <div className="finance-entry-actions">
                <button
                  type="button"
                  className="icon-button"
                  title="Изменить"
                  onClick={() => {
                    setAdding(false)
                    setEditId(entry.id)
                  }}
                >
                  <Pencil size={15} />
                  <span className="visually-hidden">Изменить поступление: {entry.note || FINANCE_LABELS[entry.kind]}</span>
                </button>
                <button type="button" className="icon-button" title="Удалить" onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={15} />
                  <span className="visually-hidden">Удалить поступление</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="finance-empty">Поступлений пока нет.</p>
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
          <Plus size={15} /> Добавить поступление
        </button>
      )}

      {total.count > 0 && <p className="finance-month-count">{withCount(total.count, ['запись', 'записи', 'записей'])}</p>}
    </article>
  )
}

import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { Currency, FinanceEntry, FinanceKind } from '../../../data'
import { CURRENCY_MARKS, CURRENCIES, FINANCE_KINDS, FINANCE_LABELS, isCurrency } from '../../../lib'
import { useFinanceStore } from '../../../store'

export type EntryFormProps = {
  month: string
  entry: FinanceEntry | null
  onDone: () => void
}

const toAmount = (value: string) => {
  const parsed = Number(value.replace(',', '.').replace(/\s/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export const EntryForm = ({ month, entry, onDone }: EntryFormProps) => {
  const addEntry = useFinanceStore((state) => state.addEntry)
  const updateEntry = useFinanceStore((state) => state.updateEntry)
  const [kind, setKind] = useState<FinanceKind>(entry?.kind ?? 'salary')
  const [amount, setAmount] = useState(entry ? String(entry.amount).replace('.', ',') : '')
  const [currency, setCurrency] = useState<Currency>(entry?.currency ?? 'RUB')
  const [note, setNote] = useState(entry?.note ?? '')
  const [formMonth, setFormMonth] = useState(entry?.month ?? month)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = toAmount(amount)
    if (value <= 0) return
    const payload = { month: formMonth, kind, amount: value, currency, note: note.trim() }
    if (entry) updateEntry(entry.id, payload)
    else addEntry(payload)
    onDone()
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <div className="entry-field" role="group" aria-label="Тип поступления">
        <span>Тип</span>
        <div className="entry-kinds">
          {FINANCE_KINDS.map((option) => (
            <button type="button" key={option} className={`mini-button${kind === option ? ' is-on' : ''}`} onClick={() => setKind(option)}>
              {FINANCE_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <label className="entry-field">
        <span>Сумма</span>
        <input type="text" inputMode="decimal" value={amount} placeholder="0" onChange={(event) => setAmount(event.target.value)} />
      </label>

      <label className="entry-field">
        <span>Валюта</span>
        <select
          value={currency}
          onChange={(event) => {
            const next = event.target.value
            if (isCurrency(next)) setCurrency(next)
          }}
        >
          {CURRENCIES.map((option) => (
            <option key={option} value={option}>
              {CURRENCY_MARKS[option]} {option}
            </option>
          ))}
        </select>
      </label>

      <label className="entry-field">
        <span>Месяц</span>
        <input type="month" aria-label="Месяц и год" value={formMonth} onChange={(event) => setFormMonth(event.target.value)} />
      </label>

      <label className="entry-field entry-field--wide">
        <span>Заметка</span>
        <input type="text" value={note} placeholder="Необязательно" onChange={(event) => setNote(event.target.value)} />
      </label>

      <div className="entry-actions">
        <button type="submit" className="add-button" disabled={toAmount(amount) <= 0}>
          <Check size={16} /> {entry ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" className="mini-button mini-button--ghost" onClick={onDone}>
          <X size={15} /> Отмена
        </button>
      </div>
    </form>
  )
}

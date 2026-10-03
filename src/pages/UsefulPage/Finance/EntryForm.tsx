import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { Currency, FinanceEntry, FinanceKind } from '../../../data'
import { CURRENCY_MARKS, CURRENCIES, FINANCE_KINDS, financeKindLabel, isCurrency } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { useFinanceStore } from '../../../store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ToggleGroup, ToggleGroupItem } from '../../../shared/ui'

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
  const { lang, t } = useTranslation()
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
      <div className="entry-field">
        <span>{t('finance.form.kind')}</span>
        <ToggleGroup
          type="single"
          value={kind}
          onValueChange={(next) => {
            if (next) setKind(next as FinanceKind)
          }}
          className="entry-kinds"
          aria-label={t('finance.form.kindAria')}
        >
          {FINANCE_KINDS.map((option) => (
            <ToggleGroupItem key={option} value={option} className="mini-button">
              {financeKindLabel(option, lang)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <label className="entry-field">
        <span>{t('finance.form.amount')}</span>
        <input type="text" inputMode="decimal" value={amount} placeholder="0" onChange={(event) => setAmount(event.target.value)} />
      </label>

      <label className="entry-field">
        <span>{t('finance.form.currency')}</span>
        <Select
          value={currency}
          onValueChange={(next) => {
            if (isCurrency(next)) setCurrency(next)
          }}
        >
          <SelectTrigger className="entry-select" aria-label={t('finance.form.currency')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((option) => (
              <SelectItem key={option} value={option}>
                {CURRENCY_MARKS[option]} {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="entry-field">
        <span>{t('finance.form.month')}</span>
        <input
          type="month"
          aria-label={t('finance.form.monthAria')}
          value={formMonth}
          onChange={(event) => setFormMonth(event.target.value)}
        />
      </label>

      <label className="entry-field entry-field--wide">
        <span>{t('finance.form.note')}</span>
        <input type="text" value={note} placeholder={t('finance.form.notePlaceholder')} onChange={(event) => setNote(event.target.value)} />
      </label>

      <div className="entry-actions">
        <button type="submit" className="add-button" disabled={toAmount(amount) <= 0}>
          <Check size={16} /> {entry ? t('common.save') : t('common.add')}
        </button>
        <button type="button" className="mini-button mini-button--ghost" onClick={onDone}>
          <X size={15} /> {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

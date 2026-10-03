import { useState } from 'react'
import { CreditCard, Plus, Save } from 'lucide-react'
import type { Currency, Loan } from '../../../../data'
import { CURRENCIES, CURRENCY_MARKS, isCurrency } from '../../../../lib'
import { LOAN_PRESETS, POPULAR_LOAN_BANKS } from '../../../../lib/finance/loans'
import { useTranslation } from '../../../../lib/i18n'
import { Modal, ToggleGroup, ToggleGroupItem } from '../../../../shared/ui'

type LoanModalProps = {
  open: boolean
  onClose: () => void
  onSave: (loan: Omit<Loan, 'id' | 'createdAt'>) => void
  loanToEdit?: Loan | null
  today: string
}

export const LoanModal = ({ open, onClose, onSave, loanToEdit, today }: LoanModalProps) => {
  const { t } = useTranslation()

  const [title, setTitle] = useState(loanToEdit?.title ?? '')
  const [bank, setBank] = useState(loanToEdit?.bank ?? POPULAR_LOAN_BANKS[0])
  const [initialAmount, setInitialAmount] = useState(loanToEdit ? String(loanToEdit.initialAmount) : '500000')
  const [remainingAmount, setRemainingAmount] = useState(loanToEdit ? String(loanToEdit.remainingAmount) : '500000')
  const [currency, setCurrency] = useState<Currency>(loanToEdit?.currency ?? 'RUB')
  const [rate, setRate] = useState(loanToEdit ? String(loanToEdit.rate) : '14.5')
  const [monthlyPayment, setMonthlyPayment] = useState(loanToEdit ? String(loanToEdit.monthlyPayment) : '18000')
  const [paymentDay, setPaymentDay] = useState(loanToEdit ? String(loanToEdit.paymentDay) : '15')
  const [startDate, setStartDate] = useState(loanToEdit?.startDate ?? today)
  const [endDate, setEndDate] = useState(loanToEdit?.endDate ?? '')
  const [note, setNote] = useState(loanToEdit?.note ?? '')

  const handleApplyPreset = (preset: (typeof LOAN_PRESETS)[number]) => {
    setTitle(preset.title)
    setBank(preset.bank)
    setRate(String(preset.rate))
    setPaymentDay(String(preset.paymentDay))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsedInitial = Number(initialAmount.replace(',', '.').replace(/\s/g, ''))
    const parsedRemaining = Number(remainingAmount.replace(',', '.').replace(/\s/g, ''))
    const parsedRate = Number(rate.replace(',', '.'))
    const parsedMonthly = Number(monthlyPayment.replace(',', '.').replace(/\s/g, ''))
    const parsedDay = Number(paymentDay)

    if (!title.trim() || !bank.trim() || !Number.isFinite(parsedInitial) || parsedInitial <= 0) {
      return
    }

    onSave({
      title: title.trim(),
      bank: bank.trim(),
      initialAmount: parsedInitial,
      remainingAmount: Number.isFinite(parsedRemaining) ? Math.max(0, parsedRemaining) : parsedInitial,
      currency,
      rate: Number.isFinite(parsedRate) ? Math.max(0, parsedRate) : 0,
      monthlyPayment: Number.isFinite(parsedMonthly) ? Math.max(0, parsedMonthly) : 0,
      paymentDay: Math.min(31, Math.max(1, Number.isFinite(parsedDay) ? parsedDay : 1)),
      startDate: startDate || today,
      endDate: endDate || '',
      note: note.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={loanToEdit ? t('finance.loans.edit') : t('finance.loans.add')} maxWidth={540}>
      <form className="fin-modal-form" onSubmit={handleSubmit}>
        {!loanToEdit && (
          <div className="fin-presets-block">
            <span className="fin-presets-label">{t('finance.loans.presets')}</span>
            <div className="fin-presets-list">
              {LOAN_PRESETS.map((preset) => (
                <button type="button" key={preset.title} className="fin-preset-chip" onClick={() => handleApplyPreset(preset)}>
                  <CreditCard size={12} />
                  <span>
                    {preset.title} ({preset.rate}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="fin-form-row">
          <label className="fin-field">
            <span className="fin-field-label">{t('finance.loans.form.title')}</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('finance.loans.form.titlePlaceholder')}
            />
          </label>

          <label className="fin-field">
            <span className="fin-field-label">{t('finance.loans.form.bank')}</span>
            <input
              type="text"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder={t('finance.loans.form.bankPlaceholder')}
              list="popular-loan-banks"
            />
            <datalist id="popular-loan-banks">
              {POPULAR_LOAN_BANKS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="fin-form-row fin-form-row--split">
          <label className="fin-field fin-field--flex">
            <span className="fin-field-label">{t('finance.loans.form.initialAmount')}</span>
            <div className="fin-input-with-addons">
              <input
                type="text"
                inputMode="decimal"
                required
                value={initialAmount}
                onChange={(e) => {
                  setInitialAmount(e.target.value)
                  if (!loanToEdit) {
                    setRemainingAmount(e.target.value)
                  }
                }}
              />
              <ToggleGroup
                type="single"
                value={currency}
                onValueChange={(next) => {
                  if (isCurrency(next)) setCurrency(next)
                }}
                className="fin-currency-toggle"
                aria-label={t('finance.loans.form.initialAmount')}
              >
                {CURRENCIES.map((cur) => (
                  <ToggleGroupItem key={cur} value={cur} className="fin-cur-btn">
                    {CURRENCY_MARKS[cur]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </label>

          <label className="fin-field fin-field--flex">
            <span className="fin-field-label">{t('finance.loans.form.remainingAmount')}</span>
            <input type="text" inputMode="decimal" required value={remainingAmount} onChange={(e) => setRemainingAmount(e.target.value)} />
          </label>
        </div>

        <div className="fin-form-row fin-form-row--split">
          <label className="fin-field fin-field--flex">
            <span className="fin-field-label">{t('finance.loans.form.monthlyPayment')}</span>
            <input type="text" inputMode="decimal" required value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} />
          </label>

          <label className="fin-field fin-field--small">
            <span className="fin-field-label">{t('finance.loans.form.rate')}</span>
            <div className="fin-input-unit">
              <input type="text" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
              <span className="fin-unit-mark">%</span>
            </div>
          </label>

          <label className="fin-field fin-field--small">
            <span className="fin-field-label">{t('finance.loans.form.paymentDay')}</span>
            <input type="number" min="1" max="31" required value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} />
          </label>
        </div>

        <div className="fin-form-row">
          <label className="fin-field">
            <span className="fin-field-label">{t('finance.loans.form.startDate')}</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="fin-field">
            <span className="fin-field-label">{t('finance.loans.form.endDate')}</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <label className="fin-field">
          <span className="fin-field-label">{t('finance.loans.form.note')}</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('finance.form.notePlaceholder')} />
        </label>

        <div className="fin-modal-actions">
          <button type="button" className="mini-button mini-button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="add-button">
            {loanToEdit ? <Save size={16} /> : <Plus size={16} />}
            {loanToEdit ? t('common.save') : t('finance.loans.add')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import { Landmark, Plus, Save } from 'lucide-react'
import type { Currency, Deposit } from '../../../../data'
import { CURRENCIES, CURRENCY_MARKS, isCurrency } from '../../../../lib'
import { DEPOSIT_PRESETS, POPULAR_DEPOSIT_BANKS } from '../../../../lib/finance/deposits'
import { useTranslation } from '../../../../lib/i18n'
import { Modal, Switch, ToggleGroup, ToggleGroupItem } from '../../../../shared/ui'

type DepositModalProps = {
  open: boolean
  onClose: () => void
  onSave: (deposit: Omit<Deposit, 'id' | 'createdAt'>) => void
  depositToEdit?: Deposit | null
  today: string
}

export const DepositModal = ({ open, onClose, onSave, depositToEdit, today }: DepositModalProps) => {
  const { t } = useTranslation()

  const [title, setTitle] = useState(depositToEdit?.title ?? '')
  const [bank, setBank] = useState(depositToEdit?.bank ?? POPULAR_DEPOSIT_BANKS[0])
  const [amount, setAmount] = useState(depositToEdit ? String(depositToEdit.amount) : '100000')
  const [currency, setCurrency] = useState<Currency>(depositToEdit?.currency ?? 'RUB')
  const [rate, setRate] = useState(depositToEdit ? String(depositToEdit.rate) : '18')
  const [startDate, setStartDate] = useState(depositToEdit?.startDate ?? today)
  const [periodMonths, setPeriodMonths] = useState(depositToEdit ? String(depositToEdit.periodMonths) : '12')
  const [isCapitalized, setIsCapitalized] = useState(depositToEdit ? depositToEdit.isCapitalized : true)
  const [canDeposit, setCanDeposit] = useState(Boolean(depositToEdit?.canDeposit))
  const [canWithdraw, setCanWithdraw] = useState(Boolean(depositToEdit?.canWithdraw))
  const [note, setNote] = useState(depositToEdit?.note ?? '')

  const handleApplyPreset = (preset: (typeof DEPOSIT_PRESETS)[number]) => {
    setTitle(preset.title)
    setBank(preset.bank)
    setRate(String(preset.rate))
    setPeriodMonths(String(preset.periodMonths))
    setIsCapitalized(preset.isCapitalized)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.').replace(/\s/g, ''))
    const parsedRate = Number(rate.replace(',', '.'))
    const parsedPeriod = Number(periodMonths)

    if (!title.trim() || !bank.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return
    }

    onSave({
      title: title.trim(),
      bank: bank.trim(),
      amount: parsedAmount,
      currency,
      rate: Number.isFinite(parsedRate) ? Math.max(0, parsedRate) : 0,
      startDate: startDate || today,
      periodMonths: Number.isFinite(parsedPeriod) && parsedPeriod > 0 ? parsedPeriod : 12,
      isCapitalized,
      canDeposit,
      canWithdraw,
      note: note.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={depositToEdit ? t('finance.deposits.edit') : t('finance.deposits.add')} maxWidth={540}>
      <form className="fin-modal-form" onSubmit={handleSubmit}>
        {!depositToEdit && (
          <div className="fin-presets-block">
            <span className="fin-presets-label">{t('finance.deposits.presets')}</span>
            <div className="fin-presets-list">
              {DEPOSIT_PRESETS.map((preset) => (
                <button type="button" key={preset.title} className="fin-preset-chip" onClick={() => handleApplyPreset(preset)}>
                  <Landmark size={12} />
                  <span>
                    {preset.bank}: {preset.rate}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="fin-form-row">
          <label className="fin-field">
            <span className="fin-field-label">{t('finance.deposits.form.title')}</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('finance.deposits.form.titlePlaceholder')}
            />
          </label>

          <label className="fin-field">
            <span className="fin-field-label">{t('finance.deposits.form.bank')}</span>
            <input
              type="text"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder={t('finance.deposits.form.bankPlaceholder')}
              list="popular-deposit-banks"
            />
            <datalist id="popular-deposit-banks">
              {POPULAR_DEPOSIT_BANKS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="fin-form-row fin-form-row--split">
          <label className="fin-field fin-field--flex">
            <span className="fin-field-label">{t('finance.deposits.form.amount')}</span>
            <div className="fin-input-with-addons">
              <input type="text" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              <ToggleGroup
                type="single"
                value={currency}
                onValueChange={(next) => {
                  if (isCurrency(next)) setCurrency(next)
                }}
                className="fin-currency-toggle"
                aria-label={t('finance.deposits.form.amount')}
              >
                {CURRENCIES.map((cur) => (
                  <ToggleGroupItem key={cur} value={cur} className="fin-cur-btn">
                    {CURRENCY_MARKS[cur]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </label>

          <label className="fin-field fin-field--small">
            <span className="fin-field-label">{t('finance.deposits.form.rate')}</span>
            <div className="fin-input-unit">
              <input type="text" inputMode="decimal" required value={rate} onChange={(e) => setRate(e.target.value)} />
              <span className="fin-unit-mark">%</span>
            </div>
          </label>
        </div>

        <div className="fin-form-row">
          <label className="fin-field">
            <span className="fin-field-label">{t('finance.deposits.form.startDate')}</span>
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="fin-field">
            <span className="fin-field-label">{t('finance.deposits.form.periodMonths')}</span>
            <input type="number" min="1" max="120" required value={periodMonths} onChange={(e) => setPeriodMonths(e.target.value)} />
          </label>
        </div>

        <div className="fin-switches-group">
          <Switch
            checked={isCapitalized}
            onCheckedChange={setIsCapitalized}
            label={t('finance.deposits.form.capitalization')}
            hint={t('finance.deposits.form.capitalizationHint')}
          />
          <Switch checked={canDeposit} onCheckedChange={setCanDeposit} label={t('finance.deposits.form.canDeposit')} />
          <Switch checked={canWithdraw} onCheckedChange={setCanWithdraw} label={t('finance.deposits.form.canWithdraw')} />
        </div>

        <label className="fin-field">
          <span className="fin-field-label">{t('finance.deposits.form.note')}</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('finance.form.notePlaceholder')} />
        </label>

        <div className="fin-modal-actions">
          <button type="button" className="mini-button mini-button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="add-button">
            {depositToEdit ? <Save size={16} /> : <Plus size={16} />}
            {depositToEdit ? t('common.save') : t('finance.deposits.add')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

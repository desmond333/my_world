import { useMemo, useState } from 'react'
import { useToday } from '../../../../hooks'
import { AlertCircle, Calendar, CheckCircle2, CreditCard, Edit2, HandCoins, Plus, Trash2 } from 'lucide-react'
import type { Loan } from '../../../../data'
import { formatMoney } from '../../../../lib'
import { calculateLoanMetrics, calculateLoansSummary } from '../../../../lib/finance/loans'
import { useTranslation } from '../../../../lib/i18n'
import { useFinanceStore, usePageViewMode } from '../../../../store'
import { ToggleGroup, ToggleGroupItem } from '../../../../shared/ui'
import { LoanModal } from './LoanModal'
import './FinanceTabs.css'

type FilterType = 'all' | 'active' | 'repaid'

export const FinanceLoansTab = () => {
  const { lang, t } = useTranslation()
  const loans = useFinanceStore((state) => state.loans)
  const addLoan = useFinanceStore((state) => state.addLoan)
  const updateLoan = useFinanceStore((state) => state.updateLoan)
  const removeLoan = useFinanceStore((state) => state.removeLoan)
  const makeLoanPayment = useFinanceStore((state) => state.makeLoanPayment)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const { today } = useToday()

  const { isNormal } = usePageViewMode('finance')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const summary = useMemo(() => calculateLoansSummary(loans, today, currency, rates), [loans, today, currency, rates])

  const loansWithMetrics = useMemo(() => {
    return loans.map((loan) => ({
      loan,
      metrics: calculateLoanMetrics(loan, today),
    }))
  }, [loans, today])

  const filteredLoans = useMemo(() => {
    return loansWithMetrics.filter(({ metrics }) => {
      if (filter === 'active') return !metrics.isFullyPaid
      if (filter === 'repaid') return metrics.isFullyPaid
      return true
    })
  }, [loansWithMetrics, filter])

  const handleOpenAdd = () => {
    setEditingLoan(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (loan: Loan) => {
    setEditingLoan(loan)
    setModalOpen(true)
  }

  const handleSave = (data: Omit<Loan, 'id' | 'createdAt'>) => {
    if (editingLoan) {
      updateLoan(editingLoan.id, data)
    } else {
      addLoan(data)
    }
  }

  const handlePayMonthly = (loan: Loan) => {
    makeLoanPayment(loan.id, loan.monthlyPayment)
  }

  return (
    <div className="fin-tab-content">
      <section className="fin-stats-grid">
        <div className="fin-stat-card">
          <span className="fin-stat-label">
            <CreditCard size={14} /> {t('finance.loans.totalDebt')}
          </span>
          <strong className="fin-stat-value is-warning">{formatMoney(summary.totalRemainingDebt, currency, lang)}</strong>
          <span className="fin-stat-sub">
            {t('finance.loans.initialTotal')}: {formatMoney(summary.totalInitialDebt, currency, lang)}
          </span>
        </div>

        <div className="fin-stat-card">
          <span className="fin-stat-label">
            <Calendar size={14} /> {t('finance.loans.monthlyLoad')}
          </span>
          <strong className="fin-stat-value">{formatMoney(summary.totalMonthlyLoad, currency, lang)}</strong>
          <span className="fin-stat-sub">
            {summary.activeCount} {t('finance.loans.filter.active').toLowerCase()}
          </span>
        </div>

        {isNormal && (
          <>
            <div className="fin-stat-card">
              <span className="fin-stat-label">
                <CheckCircle2 size={14} /> {t('finance.loans.totalRepaid')}
              </span>
              <strong className="fin-stat-value is-accent">{formatMoney(summary.totalRepaid, currency, lang)}</strong>
              <span className="fin-stat-sub">
                {t('finance.loans.annualLoad')}: {formatMoney(summary.totalAnnualLoad, currency, lang)}
              </span>
            </div>

            <div className="fin-stat-card">
              <span className="fin-stat-label">
                <AlertCircle size={14} /> {t('finance.loans.closestPayment')}
              </span>
              {summary.closestPaymentDays !== null ? (
                <>
                  <strong className="fin-stat-value">
                    {t('finance.loans.closestDays', undefined, { days: summary.closestPaymentDays })}
                  </strong>
                  <span className="fin-stat-sub">{summary.closestLoanTitle}</span>
                </>
              ) : (
                <>
                  <strong className="fin-stat-value">—</strong>
                  <span className="fin-stat-sub">{t('common.done')}</span>
                </>
              )}
            </div>
          </>
        )}
      </section>

      <div className="fin-toolbar">
        {isNormal && loans.length > 0 ? (
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(next) => {
              if (next) setFilter(next as FilterType)
            }}
            className="fin-filters"
            aria-label={t('finance.loans.filter.all')}
          >
            <ToggleGroupItem value="all" className="fin-filter-btn">
              {t('finance.loans.filter.all')} ({loans.length})
            </ToggleGroupItem>
            <ToggleGroupItem value="active" className="fin-filter-btn">
              {t('finance.loans.filter.active')} ({summary.activeCount})
            </ToggleGroupItem>
            <ToggleGroupItem value="repaid" className="fin-filter-btn">
              {t('finance.loans.filter.repaid')} ({loans.length - summary.activeCount})
            </ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <div />
        )}

        <button type="button" className="add-button" onClick={handleOpenAdd}>
          <Plus size={16} /> {t('finance.loans.add')}
        </button>
      </div>

      {filteredLoans.length === 0 ? (
        <div className="fin-empty-state">
          <CreditCard size={36} className="fin-empty-icon" />
          <p>{t('finance.loans.empty')}</p>
          <button type="button" className="add-button" onClick={handleOpenAdd}>
            <Plus size={16} /> {t('finance.loans.add')}
          </button>
        </div>
      ) : (
        <div className="fin-cards-grid">
          {filteredLoans.map(({ loan, metrics }) => {
            return (
              <article key={loan.id} className={`fin-card${metrics.isFullyPaid ? ' is-repaid' : ''}`}>
                <div className="fin-card-top">
                  <div className="fin-card-meta">
                    <span className="fin-card-bank">{loan.bank}</span>
                    <h3 className="fin-card-title">{loan.title}</h3>
                  </div>
                  <div className="fin-card-badges">
                    {loan.rate > 0 && <span className="fin-badge fin-badge--rate">{loan.rate}%</span>}
                    {metrics.isFullyPaid && (
                      <span className="fin-badge fin-badge--done">
                        <CheckCircle2 size={11} /> {t('finance.loans.fullyPaid')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="fin-card-main-amount">
                  <span className="fin-amount-large">{formatMoney(loan.remainingAmount, loan.currency, lang)}</span>
                  <span className="fin-amount-sub">
                    {t('finance.loans.initialTotal')}: {formatMoney(loan.initialAmount, loan.currency, lang)}
                  </span>
                </div>

                <div className="fin-yield-grid">
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.loans.form.monthlyPayment')}</span>
                    <span className="fin-yield-num" style={{ color: 'var(--text)' }}>
                      {formatMoney(loan.monthlyPayment, loan.currency, lang)}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.loans.form.paymentDay')}</span>
                    <span className="fin-yield-num" style={{ color: 'var(--text)' }}>
                      {t('finance.loans.paymentDayValue', undefined, { day: loan.paymentDay })}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.loans.closestPayment')}</span>
                    <span className="fin-yield-num" style={{ color: metrics.daysUntilPayment <= 3 ? 'var(--coral)' : 'var(--text)' }}>
                      {metrics.isFullyPaid ? '—' : t('finance.loans.daysShort', undefined, { days: metrics.daysUntilPayment })}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.loans.repaidProgress')}</span>
                    <span className="fin-yield-num" style={{ color: 'var(--accent)' }}>
                      {metrics.repaidPercent}%
                    </span>
                  </div>
                </div>

                {isNormal && (
                  <div className="fin-progress-wrap">
                    <div className="fin-progress-header">
                      <span>
                        {t('finance.loans.repaidProgress')}: {metrics.repaidPercent}% (
                        {formatMoney(metrics.repaidAmount, loan.currency, lang)})
                      </span>
                      <span>
                        {t('finance.loans.nextDate')}: {metrics.nextPaymentDate}
                      </span>
                    </div>
                    <div className="fin-progress-track">
                      <div
                        className={`fin-progress-fill${metrics.isFullyPaid ? ' is-complete' : ''}`}
                        style={{ width: `${metrics.repaidPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {loan.note && <p className="fin-amount-sub">{loan.note}</p>}

                <div className="fin-card-actions">
                  {!metrics.isFullyPaid && (
                    <button
                      type="button"
                      className="fin-action-btn is-primary"
                      onClick={() => handlePayMonthly(loan)}
                      title={t('finance.loans.makePayment')}
                    >
                      <HandCoins size={13} /> {t('finance.loans.makePayment')}
                    </button>
                  )}
                  <button type="button" className="fin-action-btn" onClick={() => handleOpenEdit(loan)} title={t('finance.loans.edit')}>
                    <Edit2 size={13} /> {t('finance.loans.edit')}
                  </button>
                  <button
                    type="button"
                    className="fin-action-btn fin-action-btn.is-delete"
                    onClick={() => removeLoan(loan.id)}
                    title={t('finance.loans.delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <LoanModal
        key={editingLoan ? editingLoan.id : modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        loanToEdit={editingLoan}
        today={today}
      />
    </div>
  )
}

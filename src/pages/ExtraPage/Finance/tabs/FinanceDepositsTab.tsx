import { useMemo, useState } from 'react'
import { useToday } from '../../../../hooks'
import { Calendar, CheckCircle2, Edit2, Landmark, Percent, PiggyBank, Plus, Sparkles, Trash2, TrendingUp } from 'lucide-react'
import type { Deposit } from '../../../../data'
import { CURRENCY_MARKS, formatMoney } from '../../../../lib'
import { calculateDepositYield, calculateDepositsSummary } from '../../../../lib/finance/deposits'
import { useTranslation } from '../../../../lib/i18n'
import { useFinanceStore, usePageViewMode } from '../../../../store'
import { DepositModal } from './DepositModal'
import './FinanceTabs.css'

type FilterType = 'all' | 'active' | 'expired'

export const FinanceDepositsTab = () => {
  const { lang, t } = useTranslation()
  const deposits = useFinanceStore((state) => state.deposits)
  const addDeposit = useFinanceStore((state) => state.addDeposit)
  const updateDeposit = useFinanceStore((state) => state.updateDeposit)
  const removeDeposit = useFinanceStore((state) => state.removeDeposit)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const { today } = useToday()

  const { isNormal } = usePageViewMode('finance')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const summary = useMemo(() => calculateDepositsSummary(deposits, today, currency, rates), [deposits, today, currency, rates])

  const depositsWithMetrics = useMemo(() => {
    return deposits.map((deposit) => ({
      deposit,
      metrics: calculateDepositYield(deposit, today),
    }))
  }, [deposits, today])

  const filteredDeposits = useMemo(() => {
    return depositsWithMetrics.filter(({ metrics }) => {
      if (filter === 'active') return !metrics.isExpired
      if (filter === 'expired') return metrics.isExpired
      return true
    })
  }, [depositsWithMetrics, filter])

  const handleOpenAdd = () => {
    setEditingDeposit(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit)
    setModalOpen(true)
  }

  const handleSave = (data: Omit<Deposit, 'id' | 'createdAt'>) => {
    if (editingDeposit) {
      updateDeposit(editingDeposit.id, data)
    } else {
      addDeposit(data)
    }
  }

  return (
    <div className="fin-tab-content">
      <section className="fin-stats-grid">
        <div className="fin-stat-card">
          <span className="fin-stat-label">
            <PiggyBank size={14} /> {t('finance.deposits.totalInvested')}
          </span>
          <strong className="fin-stat-value is-accent">{formatMoney(summary.totalPrincipal, currency, lang)}</strong>
          <span className="fin-stat-sub">
            {t('finance.deposits.activeCount')}: {summary.activeCount}
          </span>
        </div>

        <div className="fin-stat-card">
          <span className="fin-stat-label">
            <TrendingUp size={14} /> {t('finance.deposits.passiveIncome')} ({t('finance.deposits.perMonth')})
          </span>
          <strong className="fin-stat-value">+{formatMoney(summary.monthlyPassive, currency, lang)}</strong>
          <span className="fin-stat-sub">
            +{formatMoney(summary.dailyPassive, currency, lang)} {t('finance.deposits.perDay')}
          </span>
        </div>

        {isNormal && (
          <>
            <div className="fin-stat-card">
              <span className="fin-stat-label">
                <Calendar size={14} /> {t('finance.deposits.passiveIncome')} ({t('finance.deposits.perYear')})
              </span>
              <strong className="fin-stat-value">+{formatMoney(summary.annualPassive, currency, lang)}</strong>
              <span className="fin-stat-sub">
                +{formatMoney(summary.weeklyPassive, currency, lang)} {t('finance.deposits.perWeek')}
              </span>
            </div>

            <div className="fin-stat-card">
              <span className="fin-stat-label">
                <Percent size={14} /> {t('finance.deposits.averageRate')}
              </span>
              <strong className="fin-stat-value">{summary.averageRate}%</strong>
              <span className="fin-stat-sub">
                {t('finance.deposits.totalMaturity')}: {formatMoney(summary.totalMaturityYield, currency, lang)}
              </span>
            </div>
          </>
        )}
      </section>

      <div className="fin-toolbar">
        {isNormal && deposits.length > 0 ? (
          <div className="fin-filters">
            <button type="button" className={`fin-filter-btn${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
              {t('finance.deposits.filter.all')} ({deposits.length})
            </button>
            <button
              type="button"
              className={`fin-filter-btn${filter === 'active' ? ' is-active' : ''}`}
              onClick={() => setFilter('active')}
            >
              {t('finance.deposits.filter.active')} ({summary.activeCount})
            </button>
            <button
              type="button"
              className={`fin-filter-btn${filter === 'expired' ? ' is-active' : ''}`}
              onClick={() => setFilter('expired')}
            >
              {t('finance.deposits.filter.expired')} ({deposits.length - summary.activeCount})
            </button>
          </div>
        ) : (
          <div />
        )}

        <button type="button" className="add-button" onClick={handleOpenAdd}>
          <Plus size={16} /> {t('finance.deposits.add')}
        </button>
      </div>

      {filteredDeposits.length === 0 ? (
        <div className="fin-empty-state">
          <Landmark size={36} className="fin-empty-icon" />
          <p>{t('finance.deposits.empty')}</p>
          <button type="button" className="add-button" onClick={handleOpenAdd}>
            <Plus size={16} /> {t('finance.deposits.add')}
          </button>
        </div>
      ) : (
        <div className="fin-cards-grid">
          {filteredDeposits.map(({ deposit, metrics }) => {
            return (
              <article key={deposit.id} className={`fin-card${metrics.isExpired ? ' is-expired' : ''}`}>
                <div className="fin-card-top">
                  <div className="fin-card-meta">
                    <span className="fin-card-bank">{deposit.bank}</span>
                    <h3 className="fin-card-title">{deposit.title}</h3>
                  </div>
                  <div className="fin-card-badges">
                    <span className="fin-badge fin-badge--rate">{deposit.rate}%</span>
                    {deposit.isCapitalized && (
                      <span className="fin-badge fin-badge--capitalized">
                        <Sparkles size={11} /> %
                      </span>
                    )}
                    {metrics.isExpired && (
                      <span className="fin-badge fin-badge--done">
                        <CheckCircle2 size={11} /> {t('finance.deposits.expired')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="fin-card-main-amount">
                  <span className="fin-amount-large">{formatMoney(deposit.amount, deposit.currency, lang)}</span>
                  <span className="fin-amount-sub">
                    +{formatMoney(metrics.monthly, deposit.currency, lang)} / {t('finance.deposits.perMonth')}
                  </span>
                </div>

                <div className="fin-yield-grid">
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.deposits.perDay')}</span>
                    <span className="fin-yield-num">
                      +{Math.round(metrics.daily)} {CURRENCY_MARKS[deposit.currency]}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.deposits.perWeek')}</span>
                    <span className="fin-yield-num">
                      +{Math.round(metrics.weekly)} {CURRENCY_MARKS[deposit.currency]}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.deposits.perMonth')}</span>
                    <span className="fin-yield-num">
                      +{Math.round(metrics.monthly)} {CURRENCY_MARKS[deposit.currency]}
                    </span>
                  </div>
                  <div className="fin-yield-cell">
                    <span className="fin-yield-lbl">{t('finance.deposits.perYear')}</span>
                    <span className="fin-yield-num">
                      +{Math.round(metrics.annual)} {CURRENCY_MARKS[deposit.currency]}
                    </span>
                  </div>
                </div>

                {isNormal && (
                  <div className="fin-progress-wrap">
                    <div className="fin-progress-header">
                      <span>
                        {t('finance.deposits.termProgress')}: {metrics.progressPercent}%
                      </span>
                      <span>
                        {t('finance.deposits.maturityDate')}: {metrics.endDate}
                      </span>
                    </div>
                    <div className="fin-progress-track">
                      <div
                        className={`fin-progress-fill${metrics.isExpired ? ' is-complete' : ''}`}
                        style={{ width: `${metrics.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {deposit.note && <p className="fin-amount-sub">{deposit.note}</p>}

                <div className="fin-card-actions">
                  <button
                    type="button"
                    className="fin-action-btn"
                    onClick={() => handleOpenEdit(deposit)}
                    title={t('finance.deposits.edit')}
                  >
                    <Edit2 size={13} /> {t('finance.deposits.edit')}
                  </button>
                  <button
                    type="button"
                    className="fin-action-btn fin-action-btn.is-delete"
                    onClick={() => removeDeposit(deposit.id)}
                    title={t('finance.deposits.delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <DepositModal
        key={editingDeposit ? editingDeposit.id : modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        depositToEdit={editingDeposit}
        today={today}
      />
    </div>
  )
}

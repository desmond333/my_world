import { useMemo } from 'react'
import { AlertTriangle, PiggyBank, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useToday } from '../../../hooks'
import { calculateFinanceOverview, formatMoney, subscriptionSummary } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { useFinanceStore, usePageViewMode, useSubscriptionStore } from '../../../store'
import { ToggleGroup, ToggleGroupItem } from '../../../shared/ui'
import './tabs/FinanceTabs.css'
import './FinanceOverview.css'

export const FinanceOverviewPanel = () => {
  const { lang, t } = useTranslation()
  const { isNormal } = usePageViewMode('finance')

  const entries = useFinanceStore((state) => state.entries)
  const balance = useFinanceStore((state) => state.balance)
  const deposits = useFinanceStore((state) => state.deposits)
  const loans = useFinanceStore((state) => state.loans)
  const currency = useFinanceStore((state) => state.currency)
  const rates = useFinanceStore((state) => state.rates)
  const riskProfile = useFinanceStore((state) => state.riskProfile ?? 'balanced')
  const setRiskProfile = useFinanceStore((state) => state.setRiskProfile)
  const subscriptions = useSubscriptionStore((state) => state.items)
  const { today } = useToday()

  const overview = useMemo(() => {
    const subscriptionMonthly = subscriptionSummary(subscriptions, today, currency, rates, lang).monthTotal
    return calculateFinanceOverview({
      entries,
      balance,
      deposits,
      loans,
      subscriptionMonthly,
      currency,
      rates,
      today,
      riskProfile,
    })
  }, [entries, balance, deposits, loans, subscriptions, currency, rates, today, lang, riskProfile])

  const hasData = entries.length > 0 || deposits.length > 0 || loans.length > 0 || subscriptions.length > 0
  const money = (value: number) => formatMoney(Math.round(value), currency, lang)
  const isNegative = overview.monthlyNet < 0
  const maxForecastAbs = Math.max(...overview.forecast.map((item) => Math.abs(item.balance)), 1)

  return (
    <section className="finance-overview" aria-label={t('finance.overview.title')}>
      <div className="finance-overview-head">
        <Scale size={16} />
        <h3>{t('finance.overview.title')}</h3>
      </div>

      <div className="finance-risk">
        <div className="finance-risk-info">
          <span className="finance-risk-title">{t('finance.risk.title', 'Профиль риска')}</span>
          <span className="finance-risk-hint">{t('finance.risk.hint', 'Влияет на сценарий прогноза баланса.')}</span>
        </div>
        <ToggleGroup
          type="single"
          value={riskProfile}
          onValueChange={(next) => {
            if (next) setRiskProfile(next as typeof riskProfile)
          }}
          className="finance-risk-options"
          aria-label={t('finance.risk.title', 'Профиль риска')}
        >
          {(['cautious', 'balanced', 'bold'] as const).map((profile) => (
            <ToggleGroupItem key={profile} value={profile} className="finance-risk-btn">
              {t(`finance.risk.${profile}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {!hasData ? (
        <p className="finance-overview-empty">{t('finance.overview.empty')}</p>
      ) : (
        <>
          <div className="fin-stats-grid finance-overview-grid">
            <article className="fin-stat-card">
              <div className="fin-stat-head">
                <PiggyBank size={16} className="fin-stat-icon" />
                <span className="fin-stat-label">{t('finance.overview.savings')}</span>
              </div>
              <strong className="fin-stat-value is-accent">{money(overview.savings)}</strong>
            </article>

            <article className="fin-stat-card">
              <div className="fin-stat-head">
                <TrendingUp size={16} className="fin-stat-icon" />
                <span className="fin-stat-label">{t('finance.overview.income')}</span>
              </div>
              <strong className="fin-stat-value">{money(overview.monthlyIncome)}</strong>
              <span className="fin-stat-sub">
                {t('finance.overview.salary')} {money(overview.monthlySalary)} · {t('finance.overview.deposits')}{' '}
                {money(overview.monthlyDepositIncome)}
              </span>
            </article>

            <article className="fin-stat-card">
              <div className="fin-stat-head">
                <TrendingDown size={16} className={`fin-stat-icon ${isNegative ? 'is-warning' : ''}`} />
                <span className="fin-stat-label">{t('finance.overview.expenses')}</span>
              </div>
              <strong className={`fin-stat-value ${isNegative ? 'is-warning' : ''}`}>{money(overview.monthlyExpenses)}</strong>
              <span className="fin-stat-sub">
                {t('finance.overview.loans')} {money(overview.monthlyLoanLoad)} · {t('finance.overview.subscriptions')}{' '}
                {money(overview.monthlySubscriptions)}
              </span>
            </article>

            <article className={`fin-stat-card ${isNegative ? 'is-negative' : ''}`}>
              <div className="fin-stat-head">
                <Wallet size={16} className="fin-stat-icon" />
                <span className="fin-stat-label">{t('finance.overview.net')}</span>
              </div>
              <strong className={`fin-stat-value ${isNegative ? 'is-warning' : 'is-positive'}`}>
                {overview.monthlyNet >= 0 ? '+' : ''}
                {money(overview.monthlyNet)}
              </strong>
              <span className="fin-stat-sub">
                {t('finance.overview.runway')}:{' '}
                {overview.runwayMonths === null
                  ? t('finance.overview.runwayPositive')
                  : t('finance.overview.runwayMonths', undefined, { count: Math.floor(overview.runwayMonths) })}
              </span>
            </article>
          </div>

          {overview.runwayMonths !== null ? (
            <div className="finance-runway-alert">
              <AlertTriangle size={16} />
              <span>{t('finance.overview.runwayHint', undefined, { count: Math.floor(overview.runwayMonths) })}</span>
            </div>
          ) : (
            <div className="finance-runway-safe">
              <TrendingUp size={16} />
              <span>{t('finance.overview.runwaySafe')}</span>
            </div>
          )}

          {isNormal && isNegative && (
            <div className="finance-forecast">
              <span className="finance-forecast-label">{t('finance.overview.forecast')}</span>
              <div className="finance-forecast-bars">
                {overview.forecast.map((item) => (
                  <div key={item.month} className="finance-forecast-bar">
                    <div className="finance-forecast-track">
                      <div
                        className={`finance-forecast-fill ${item.balance < 0 ? 'is-negative' : ''}`}
                        style={{ height: `${Math.min(100, Math.round((Math.abs(item.balance) / maxForecastAbs) * 100))}%` }}
                      />
                    </div>
                    <span className="finance-forecast-month">{t('finance.overview.month', undefined, { count: item.month })}</span>
                    <span className={`finance-forecast-value ${item.balance < 0 ? 'is-negative' : ''}`}>{money(item.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

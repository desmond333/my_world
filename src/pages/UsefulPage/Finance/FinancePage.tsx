import { Outlet } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { SectionTabs } from '../../../widgets'
import { ViewModeToggle } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import { usePageViewMode } from '../../../store'
import { financeTabs, toFinanceTab } from './financeTabs'
import { FinanceOverviewPanel } from './FinanceOverviewPanel'
import './Finance.css'

export const FinancePage = () => {
  const { lang, t } = useTranslation()
  const { mode, setMode } = usePageViewMode('finance')

  return (
    <div className="finance-page">
      <section className="useful-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">
              <Wallet size={15} /> {t('finance.kicker')}
            </p>
            <h1>{t('finance.title')}</h1>
            <p className="intro">{t('finance.intro')}</p>
          </div>
          <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
        </div>
      </section>
      <FinanceOverviewPanel />
      <SectionTabs tabs={financeTabs.map((tab) => toFinanceTab(tab, lang))} label={t('finance.tabsAria')} />
      <section className="useful-section">
        <Outlet />
      </section>
    </div>
  )
}

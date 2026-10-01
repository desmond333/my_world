import { Outlet } from 'react-router-dom'
import { Target } from 'lucide-react'
import { SectionTabs } from '../../../widgets'
import { ViewModeToggle } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import { usePageViewMode } from '../../../store'
import { productivityTabs, toProductivityTab } from './productivityTabs'
import './Productivity.css'

export const ProductivityPage = () => {
  const { lang, t } = useTranslation()
  const { mode, setMode } = usePageViewMode('productivity')

  return (
    <>
      <section className="extra-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">
              <Target size={15} /> {t('productivity.kicker')}
            </p>
            <h1>{t('productivity.title')}</h1>
            <p className="intro">{t('productivity.intro')}</p>
          </div>
          <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
        </div>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={productivityTabs.map((tab) => toProductivityTab(tab, lang))} label={t('productivity.tabsAria')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

import { Outlet } from 'react-router-dom'
import { Target } from 'lucide-react'
import { SectionTabs } from '../../../components/SectionTabs/SectionTabs'
import { useTranslation } from '../../../lib/i18n'
import { productivityTabs, toProductivityTab } from './productivityTabs'
import './Productivity.css'

export const ProductivityPage = () => {
  const { lang, t } = useTranslation()

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Target size={15} /> {t('productivity.kicker')}
        </p>
        <h1>{t('productivity.title')}</h1>
        <p className="intro">{t('productivity.intro')}</p>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={productivityTabs.map((tab) => toProductivityTab(tab, lang))} label={t('productivity.tabsAria')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

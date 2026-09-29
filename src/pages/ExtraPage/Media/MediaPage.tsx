import { Outlet } from 'react-router-dom'
import { SectionTabs } from '../../../components/SectionTabs/SectionTabs'
import { useTranslation } from '../../../lib/i18n'
import { mediaTabs, toMediaTab } from './mediaTabs'

export const MediaPage = () => {
  const { lang, t } = useTranslation()

  return (
    <section className="extra-section">
      <SectionTabs tabs={mediaTabs.map((tab) => toMediaTab(tab, lang))} label={t('media.tabsAria')} variant="sub" />
      <Outlet />
    </section>
  )
}

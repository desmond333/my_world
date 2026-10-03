import { Outlet } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'
import { SectionTabs } from '../../../widgets'
import { ViewModeToggle } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import { usePageViewMode } from '../../../store'
import { mediaTabs, toMediaTab } from './mediaTabs'

export const MediaPage = () => {
  const { lang, t } = useTranslation()
  const { mode, setMode } = usePageViewMode('media')

  return (
    <div className="media-page">
      <section className="useful-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">
              <Clapperboard size={15} /> {t('section.media')}
            </p>
            <h1>{t('section.media')}</h1>
            <p className="intro">{t('section.media.hint')}</p>
          </div>
          <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
        </div>
      </section>
      <SectionTabs tabs={mediaTabs.map((tab) => toMediaTab(tab, lang))} label={t('media.tabsAria')} />
      <section className="useful-section">
        <Outlet />
      </section>
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { Heart, Moon } from 'lucide-react'
import { SectionTabs, type SectionTab } from '../../../widgets'
import { useTranslation } from '../../../lib/i18n'
import '../Productivity/Productivity.css'

export const MindPage = () => {
  const { t } = useTranslation()

  const tabs: SectionTab[] = [
    {
      to: '/extra/mind/dreams',
      label: t('mind.tab.dreams'),
      hint: t('mind.tab.dreamsHint'),
      icon: Moon,
      end: true,
    },
    {
      to: '/extra/mind/mood',
      label: t('mind.tab.mood'),
      hint: t('mind.tab.moodHint'),
      icon: Heart,
      end: true,
    },
  ]

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Moon size={15} /> {t('mind.kicker')}
        </p>
        <h1>{t('mind.title')}</h1>
        <p className="intro">{t('mind.intro')}</p>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={tabs} label={t('mind.tabsAria')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

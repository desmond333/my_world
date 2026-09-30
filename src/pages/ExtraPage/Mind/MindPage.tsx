import { Outlet } from 'react-router-dom'
import { Heart, Moon } from 'lucide-react'
import { SectionTabs, type SectionTab } from '../../../components/SectionTabs/SectionTabs'
import { useTranslation } from '../../../lib/i18n'
import '../Productivity/Productivity.css'

export const MindPage = () => {
  const { t } = useTranslation()

  const tabs: SectionTab[] = [
    {
      to: '/extra/mind/dreams',
      label: t('mind.tab.dreams', 'Дневник снов'),
      hint: t('mind.tab.dreamsHint', 'хроника сновидений'),
      icon: Moon,
      end: true,
    },
    {
      to: '/extra/mind/mood',
      label: t('mind.tab.mood', 'Настроение'),
      hint: t('mind.tab.moodHint', 'трекер дня'),
      icon: Heart,
      end: true,
    },
  ]

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Moon size={15} /> {t('mind.kicker', 'дополнительно · дневник')}
        </p>
        <h1>{t('mind.title', 'Дневник')}</h1>
        <p className="intro">
          {t('mind.intro', 'Дневник снов и трекер настроения. Записывай сюжеты ночных сновидений и следи за эмоциональным состоянием.')}
        </p>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={tabs} label={t('mind.tabsAria', 'Вкладки дневника')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

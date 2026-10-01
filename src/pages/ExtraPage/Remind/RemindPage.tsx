import { Outlet } from 'react-router-dom'
import { Bell, Cake } from 'lucide-react'
import { SectionTabs, type SectionTab } from '../../../widgets'
import { useTranslation } from '../../../lib/i18n'

export const RemindPage = () => {
  const { t } = useTranslation()

  const tabs: SectionTab[] = [
    {
      to: '/extra/remind/birthdays',
      label: t('remind.tab.birthdays'),
      hint: t('remind.tab.birthdaysHint'),
      icon: Cake,
      end: true,
    },
  ]

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Bell size={15} /> {t('remind.kicker')}
        </p>
        <h1>{t('remind.title')}</h1>
        <p className="intro">{t('remind.intro')}</p>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={tabs} label={t('remind.tabsAria')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

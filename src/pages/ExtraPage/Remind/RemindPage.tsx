import { Outlet } from 'react-router-dom'
import { Bell, Cake } from 'lucide-react'
import { SectionTabs, type SectionTab } from '../../../widgets'
import { useTranslation } from '../../../lib/i18n'

export const RemindPage = () => {
  const { t } = useTranslation()

  const tabs: SectionTab[] = [
    {
      to: '/extra/remind/birthdays',
      label: t('remind.tab.birthdays', 'Дни рождения'),
      hint: t('remind.tab.birthdaysHint', 'календарь и близкие'),
      icon: Cake,
      end: true,
    },
  ]

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Bell size={15} /> {t('remind.kicker', 'дополнительно · напомнить')}
        </p>
        <h1>{t('remind.title', 'Напомнить')}</h1>
        <p className="intro">
          {t('remind.intro', 'Дни рождения друзей и близких, важные даты и памятные события. Ни один праздник не останется забытым.')}
        </p>
      </section>
      <section className="extra-section">
        <SectionTabs tabs={tabs} label={t('remind.tabsAria', 'Вкладки напоминаний')} variant="sub" />
        <Outlet />
      </section>
    </>
  )
}

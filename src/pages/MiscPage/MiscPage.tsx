import { Outlet, useLocation } from 'react-router-dom'
import { Laugh } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { CreatorNote } from '../../components/CreatorNote/CreatorNote'
import { ExtraNav } from '../../components/ExtraNav/ExtraNav'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import { miscSections } from './sections'
import './MiscPage.css'

export const MiscPage = () => {
  const { t } = useTranslation()
  const extraTab = useDailyStore((state) => state.extraTab)
  const toggleExtraTab = useDailyStore((state) => state.toggleExtraTab)
  const { pathname } = useLocation()

  const navItems = miscSections.map((section) => ({
    to: `/misc/${section.key}`,
    label: t(`section.${section.key}`, section.label),
    hint: t(`section.${section.key}.hint`, section.hint),
    icon: section.icon,
    end: false,
  }))

  const active = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''

  return (
    <main className="page-shell">
      <AppTopbar />

      {extraTab ? (
        <div className="extra-layout">
          <div className="extra-content">
            <Outlet />
            <footer>
              <span>{t('footer.device')}</span>
              <span className="footer-note">
                <Laugh size={14} /> {t('footer.mood')}
              </span>
              <CreatorNote />
            </footer>
          </div>
          <ExtraNav items={navItems} active={active} />
        </div>
      ) : (
        <section className="favorites-empty extra-off">
          <h2>Раздел выключен</h2>
          <p>«Разное» включается ползунком в настройках на главной — там же, где блоки дня.</p>
          <button className="add-button" type="button" onClick={toggleExtraTab}>
            Включить раздел
          </button>
        </section>
      )}
    </main>
  )
}

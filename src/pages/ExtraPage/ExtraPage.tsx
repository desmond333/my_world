import { Outlet, useLocation } from 'react-router-dom'
import { CircleDollarSign } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { CreatorNote } from '../../components/CreatorNote/CreatorNote'
import { ExtraNav } from '../../components/ExtraNav/ExtraNav'
import { useDailyStore } from '../../store'
import { extraSections } from './sections'
import './ExtraPage.css'

const navItems = extraSections.map((section) => ({
  to: `/extra/${section.key}`,
  label: section.label,
  hint: section.hint,
  icon: section.icon,
  end: section.key === 'media' || section.key === 'productivity',
}))

export const ExtraPage = () => {
  const extraTab = useDailyStore((state) => state.extraTab)
  const toggleExtraTab = useDailyStore((state) => state.toggleExtraTab)
  const { pathname } = useLocation()
  const active = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''

  return (
    <main className="page-shell">
      <AppTopbar />

      {extraTab ? (
        <div className="extra-layout">
          <div className="extra-content">
            <Outlet />
            <footer>
              <span>всё хранится на этом устройстве</span>
              <span className="footer-note">
                <CircleDollarSign size={14} /> курсы подтягиваются с сервера
              </span>
              <CreatorNote />
            </footer>
          </div>
          <ExtraNav items={navItems} active={active} />
        </div>
      ) : (
        <section className="favorites-empty extra-off">
          <h2>Вкладка выключена</h2>
          <p>«Дополнительно» включается ползунком в настройках на главной — там же, где блоки дня.</p>
          <button className="add-button" type="button" onClick={toggleExtraTab}>
            Включить вкладку
          </button>
        </section>
      )}
    </main>
  )
}

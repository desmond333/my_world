import { Outlet, useLocation } from 'react-router-dom'
import { CircleDollarSign } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { CreatorNote } from '../../components/CreatorNote/CreatorNote'
import { ExtraNav } from '../../components/ExtraNav/ExtraNav'
import { useTranslation } from '../../lib/i18n'
import { usefulSections } from './sections'
import './ExtraPage.css'

export const ExtraPage = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const navItems = usefulSections.map((section) => ({
    to: `/extra/${section.key}`,
    label: t(`section.${section.key}`, section.label),
    hint: t(`section.${section.key}.hint`, section.hint),
    icon: section.icon,
  }))

  const active = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="extra-layout">
        <div className="extra-content">
          <Outlet />
          <footer>
            <span>{t('footer.device')}</span>
            <span className="footer-note">
              <CircleDollarSign size={14} /> {t('section.finance.hint')}
            </span>
            <CreatorNote />
          </footer>
        </div>
        <ExtraNav items={navItems} active={active} />
      </div>
    </main>
  )
}

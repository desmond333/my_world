import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CircleDollarSign } from 'lucide-react'
import { AppFooter, AppTopbar, ExtraNav } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import { usefulSections } from './sections'
import './ExtraPage.css'

export const ExtraPage = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])
  const hideSection = useDailyStore((state) => state.hideSection)

  const visibleSections = usefulSections.filter((section) => !hiddenSections.includes(section.key))

  const navItems = visibleSections.map((section) => ({
    key: section.key,
    to: `/extra/${section.key}`,
    label: t(`section.${section.key}`, section.label),
    hint: t(`section.${section.key}.hint`, section.hint),
    icon: section.icon,
  }))

  const active = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''
  const activeHint = navItems.find((item) => item.to === active)?.hint ?? ''

  useEffect(() => {
    if (visibleSections.length === 0) return
    const currentSectionKey = usefulSections.find((s) => pathname.startsWith(`/extra/${s.key}`))?.key
    if (currentSectionKey && hiddenSections.includes(currentSectionKey)) {
      navigate(`/extra/${visibleSections[0].key}`, { replace: true })
    }
  }, [pathname, hiddenSections, visibleSections, navigate])

  const handleHide = (key: string) => {
    hideSection(key)
    const remaining = visibleSections.filter((s) => s.key !== key)
    if (pathname.startsWith(`/extra/${key}`) && remaining.length > 0) {
      navigate(`/extra/${remaining[0].key}`, { replace: true })
    }
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="extra-layout">
        <div className="extra-content">
          <Outlet />
          <AppFooter
            leftText={t('footer.device')}
            note={
              <>
                <CircleDollarSign size={14} /> {activeHint}
              </>
            }
          />
        </div>
        <ExtraNav items={navItems} active={active} onHideSection={handleHide} />
      </div>
    </main>
  )
}

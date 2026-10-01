import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Laugh } from 'lucide-react'
import { AppFooter, AppTopbar, ExtraNav } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import { miscSections } from './sections'
import './MiscPage.css'

export const MiscPage = () => {
  const { t } = useTranslation()
  const extraTab = useDailyStore((state) => state.extraTab)
  const toggleExtraTab = useDailyStore((state) => state.toggleExtraTab)
  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])
  const hideSection = useDailyStore((state) => state.hideSection)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const visibleSections = miscSections.filter((section) => !hiddenSections.includes(section.key))

  const navItems = visibleSections.map((section) => ({
    key: section.key,
    to: `/misc/${section.key}`,
    label: t(`section.${section.key}`, section.label),
    hint: t(`section.${section.key}.hint`, section.hint),
    icon: section.icon,
    end: false,
  }))

  const active = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''

  useEffect(() => {
    if (visibleSections.length === 0) return
    const currentSectionKey = miscSections.find((s) => pathname.startsWith(`/misc/${s.key}`))?.key
    if (currentSectionKey && hiddenSections.includes(currentSectionKey)) {
      navigate(`/misc/${visibleSections[0].key}`, { replace: true })
    }
  }, [pathname, hiddenSections, visibleSections, navigate])

  const handleHide = (key: string) => {
    hideSection(key)
    const remaining = visibleSections.filter((s) => s.key !== key)
    if (pathname.startsWith(`/misc/${key}`) && remaining.length > 0) {
      navigate(`/misc/${remaining[0].key}`, { replace: true })
    }
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      {extraTab ? (
        <div className="extra-layout">
          <div className="extra-content">
            <Outlet />
            <AppFooter
              leftText={t('footer.device')}
              note={
                <>
                  <Laugh size={14} /> {t('footer.mood')}
                </>
              }
            />
          </div>
          <ExtraNav items={navItems} active={active} onHideSection={handleHide} />
        </div>
      ) : (
        <section className="favorites-empty extra-off">
          <h2>{t('sectionOff.title')}</h2>
          <p>{t('sectionOff.misc')}</p>
          <button className="add-button" type="button" onClick={toggleExtraTab}>
            {t('sectionOff.enable')}
          </button>
        </section>
      )}
    </main>
  )
}

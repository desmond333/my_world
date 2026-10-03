import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CircleDollarSign } from 'lucide-react'
import { AppFooter, AppTopbar, UsefulNav, type UsefulNavGroup, type UsefulNavItem } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import { mediaTabs } from './Media/mediaTabs'
import { usefulSectionGroups } from '../../lib/usefulSections'
import './UsefulPage.css'

export const UsefulPage = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])
  const hideSection = useDailyStore((state) => state.hideSection)

  const groups: UsefulNavGroup[] = useMemo(
    () =>
      usefulSectionGroups
        .map((group) => ({
          id: group.id,
          label: t(`usefulGroup.${group.id}`, group.label),
          items: group.items
            .filter((section) => !hiddenSections.includes(section.key))
            .map((section) => {
              const children: UsefulNavItem[] | undefined =
                section.key === 'media'
                  ? mediaTabs.map((tab) => ({
                      to: `/useful/media/${tab.key}`,
                      label: t(`media.tab.${tab.key}`, tab.label),
                      hint: t(`media.tab.${tab.key}Hint`, tab.hint),
                      icon: tab.icon,
                    }))
                  : undefined
              return {
                key: section.key,
                to: `/useful/${section.key}`,
                label: t(`section.${section.key}`, section.label),
                hint: t(`section.${section.key}.hint`, section.hint),
                icon: section.icon,
                children,
              }
            }),
        }))
        .filter((group) => group.items.length > 0),
    [hiddenSections, t],
  )

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups])
  const active = flat.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))?.to ?? ''
  const activeHint = flat.find((item) => item.to === active)?.hint ?? ''

  useEffect(() => {
    if (flat.length === 0) return
    const currentKey = flat.find((item) => pathname.startsWith(item.to))?.key
    if (currentKey && hiddenSections.includes(currentKey)) {
      navigate(flat[0].to, { replace: true })
    }
  }, [pathname, hiddenSections, flat, navigate])

  const handleHide = (key: string) => {
    hideSection(key)
    const remaining = flat.filter((item) => item.key !== key)
    if (pathname.startsWith(`/useful/${key}`) && remaining.length > 0) {
      navigate(remaining[0].to, { replace: true })
    }
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="useful-layout">
        <div className="useful-content">
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
        <UsefulNav groups={groups} active={active} onHideSection={handleHide} />
      </div>
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { EyeOff, MoreHorizontal } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { ConfirmDialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../shared/ui'
import './UsefulNav.css'

export type UsefulNavItem = {
  key?: string
  to: string
  label: string
  hint: string
  icon: LucideIcon
  end?: boolean
  children?: UsefulNavItem[]
}

export type UsefulNavGroup = {
  id: string
  label: string
  items: UsefulNavItem[]
}

export type UsefulNavProps = {
  groups: UsefulNavGroup[]
  active: string
  onHideSection?: (key: string) => void
}

export const UsefulNav = ({ groups, active, onHideSection }: UsefulNavProps) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [pendingHide, setPendingHide] = useState<UsefulNavItem | null>(null)
  const [pinned, setPinned] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const stickyTop = 16
    let raf = 0
    const update = () => {
      raf = 0
      setPinned(el.getBoundingClientRect().top <= stickyTop + 0.5)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  const confirmHide = () => {
    if (pendingHide?.key && onHideSection) onHideSection(pendingHide.key)
    setPendingHide(null)
  }

  const flatItems = groups.flatMap((group) => group.items)
  const indexByTo = new Map(flatItems.map((item, index) => [item.to, index + 1]))

  return (
    <nav ref={navRef} className={`useful-nav${pinned ? ' is-pinned' : ''}`} aria-label={t('usefulNav.label')}>
      <p className="useful-nav-title">{t('usefulNav.title')}</p>

      {groups.map((group) => (
        <div key={group.id} className="useful-nav-group">
          <p className="useful-nav-group-title">{group.label}</p>
          <ol className="useful-nav-list">
            {group.items.map((item) => {
              const Icon = item.icon
              const isCurrent = item.to === active
              const index = indexByTo.get(item.to) ?? 0

              return (
                <li key={item.to} className="useful-nav-entry">
                  <div className={`useful-nav-row${isCurrent ? ' is-on' : ''}`}>
                    <NavLink to={item.to} end={item.end} className={`useful-nav-item${isCurrent ? ' is-on' : ''}`} title={item.hint}>
                      <span className="useful-nav-index">{String(index).padStart(2, '0')}</span>
                      <span className="useful-nav-icon">
                        <Icon size={17} />
                      </span>
                      <span className="useful-nav-text">
                        <span className="useful-nav-label">{item.label}</span>
                        <span className="useful-nav-hint">{item.hint}</span>
                      </span>
                    </NavLink>

                    {item.key && onHideSection && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`useful-nav-more-btn${isCurrent ? ' is-on' : ''}`}
                            aria-label={`${t('nav.section.options')}: ${item.label}`}
                            title={t('nav.section.options')}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem destructive onSelect={() => setPendingHide(item)}>
                            <EyeOff size={14} />
                            <span>{t('nav.section.hide')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {item.children && item.children.length > 0 && (
                    <ul className="useful-nav-children">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              className={({ isActive }) => `useful-nav-child${isActive ? ' is-on' : ''}`}
                              title={child.hint}
                            >
                              <ChildIcon size={14} />
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      ))}

      <ConfirmDialog
        open={pendingHide !== null}
        title={t('nav.section.hideConfirmTitle')}
        description={pendingHide ? t('nav.section.hideConfirmDesc', undefined, { name: pendingHide.label }) : undefined}
        confirmLabel={t('nav.section.hide')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmHide}
        onCancel={() => setPendingHide(null)}
        danger
      />
    </nav>
  )
}

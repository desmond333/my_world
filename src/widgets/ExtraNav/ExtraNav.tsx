import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { EyeOff, MoreHorizontal } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { ConfirmDialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../shared/ui'
import './ExtraNav.css'

export type ExtraNavItem = {
  key?: string
  to: string
  label: string
  hint: string
  icon: LucideIcon
  end?: boolean
}

export type ExtraNavProps = {
  items: ExtraNavItem[]
  active: string
  onHideSection?: (key: string) => void
}

export const ExtraNav = ({ items, active, onHideSection }: ExtraNavProps) => {
  const { t } = useTranslation()
  const [pendingHide, setPendingHide] = useState<ExtraNavItem | null>(null)

  const confirmHide = () => {
    if (pendingHide?.key && onHideSection) onHideSection(pendingHide.key)
    setPendingHide(null)
  }

  return (
    <nav className="extra-nav" aria-label={t('extraNav.label')}>
      <p className="extra-nav-title">{t('extraNav.title')}</p>
      <ol className="extra-nav-list">
        {items.map((item, index) => {
          const Icon = item.icon
          const isCurrent = item.to === active

          return (
            <li key={item.to} className={`extra-nav-entry${isCurrent ? ' is-on' : ''}`}>
              <NavLink to={item.to} end={item.end} className={`extra-nav-item${isCurrent ? ' is-on' : ''}`} title={item.hint}>
                <span className="extra-nav-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="extra-nav-icon">
                  <Icon size={17} />
                </span>
                <span className="extra-nav-text">
                  <span className="extra-nav-label">{item.label}</span>
                  <span className="extra-nav-hint">{item.hint}</span>
                </span>
              </NavLink>

              {item.key && onHideSection && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`extra-nav-more-btn${isCurrent ? ' is-on' : ''}`}
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
            </li>
          )
        })}
      </ol>

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

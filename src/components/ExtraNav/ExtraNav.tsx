import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import './ExtraNav.css'

export type ExtraNavItem = {
  to: string
  label: string
  hint: string
  icon: LucideIcon
  end?: boolean
}

export type ExtraNavProps = {
  items: ExtraNavItem[]
  active: string
}

export const ExtraNav = ({ items, active }: ExtraNavProps) => {
  const { t } = useTranslation()

  return (
    <nav className="extra-nav" aria-label={t('extraNav.label')}>
      <p className="extra-nav-title">{t('extraNav.title')}</p>
      <ol className="extra-nav-list">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={`extra-nav-item${item.to === active ? ' is-on' : ''}`} title={item.hint}>
                <span className="extra-nav-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="extra-nav-icon">
                  <Icon size={17} />
                </span>
                <span className="extra-nav-text">
                  <span className="extra-nav-label">{item.label}</span>
                  <span className="extra-nav-hint">{item.hint}</span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

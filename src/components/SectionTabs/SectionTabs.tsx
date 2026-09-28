import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export type SectionTab = {
  to: string
  label: string
  hint: string
  icon: LucideIcon
  end?: boolean
}

export type SectionTabsProps = {
  tabs: SectionTab[]
  label: string
  variant: 'primary' | 'sub'
}

export const SectionTabs = ({ tabs, label, variant }: SectionTabsProps) => (
  <nav className={`section-tabs section-tabs--${variant}`} aria-label={label}>
    {tabs.map((tab) => {
      const Icon = tab.icon
      return (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `section-tab${isActive ? ' is-on' : ''}`}
          title={tab.hint}
        >
          <Icon size={16} />
          <span className="section-tab-label">{tab.label}</span>
          <span className="section-tab-hint">{tab.hint}</span>
        </NavLink>
      )
    })}
  </nav>
)

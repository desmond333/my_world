import { useId } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { EASE } from '../../lib/motion'

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
}

export const SectionTabs = ({ tabs, label }: SectionTabsProps) => {
  const layoutId = useId()

  return (
    <nav className="ui-tabs-list section-tabs-nav" aria-label={label}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `ui-tabs-trigger${isActive ? ' is-active' : ''}`}
            title={tab.hint}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={`section-tab-indicator-${layoutId}`}
                    className="ui-tabs-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7, ease: EASE.out }}
                  />
                )}
                <span className="ui-tabs-trigger-content">
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

export type BadgeVariant = 'default' | 'accent' | 'coral' | 'muted' | 'success' | 'outline' | 'warning' | 'vip' | 'price' | 'count'

export type BadgeSize = 'sm' | 'md' | 'lg'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
  interactive?: boolean
}

export const Badge = ({ variant = 'default', size = 'md', icon, interactive = false, children, className, ...props }: BadgeProps) => {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ui-badge--${size}${interactive ? ' ui-badge--interactive' : ''} ${className ?? ''}`.trim()}
      {...props}
    >
      {icon && (
        <span className="ui-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children !== undefined && children !== null && <span className="ui-badge__text">{children}</span>}
    </span>
  )
}

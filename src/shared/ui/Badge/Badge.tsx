import type { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

export type BadgeVariant = 'default' | 'accent' | 'coral' | 'muted' | 'success' | 'outline'
export type BadgeSize = 'sm' | 'md'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
}

export const Badge = ({ variant = 'default', size = 'md', icon, children, className, ...props }: BadgeProps) => {
  return (
    <span className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className ?? ''}`.trim()} {...props}>
      {icon}
      {children}
    </span>
  )
}

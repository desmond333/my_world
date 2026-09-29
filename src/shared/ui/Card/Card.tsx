import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export type CardVariant = 'default' | 'flat' | 'interactive'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  title?: ReactNode
  subtitle?: ReactNode
}

export const Card = ({ variant = 'default', title, subtitle, children, className, ...props }: CardProps) => {
  return (
    <div className={`ui-card ui-card--${variant} ${className ?? ''}`.trim()} {...props}>
      {(title || subtitle) && (
        <div className="ui-card-header">
          {title && (typeof title === 'string' ? <h3 className="ui-card-title">{title}</h3> : title)}
          {subtitle && (typeof subtitle === 'string' ? <p className="ui-card-subtitle">{subtitle}</p> : subtitle)}
        </div>
      )}
      {children}
    </div>
  )
}

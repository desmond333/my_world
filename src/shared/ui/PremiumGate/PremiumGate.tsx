import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '../Button/Button'
import './PremiumGate.css'

export type PremiumGateProps = {
  locked: boolean
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
  children: ReactNode
}

export const PremiumGate = ({ locked, title, description, actionLabel, onAction, children }: PremiumGateProps) => {
  if (!locked) return <>{children}</>

  return (
    <div className="premium-gate">
      <div className="premium-gate-preview" aria-hidden="true">
        {children}
      </div>
      <div className="premium-gate-overlay">
        <span className="premium-gate-lock">
          <Lock size={20} />
        </span>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

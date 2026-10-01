import type { ReactNode } from 'react'

export type DailyOverviewProps = {
  children?: ReactNode
  className?: string
}

export const DailyOverview = ({ children, className = '' }: DailyOverviewProps) => {
  return <div className={`daily-overview ${className}`.trim()}>{children}</div>
}

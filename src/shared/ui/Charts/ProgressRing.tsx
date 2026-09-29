import type { ReactNode } from 'react'
import './Charts.css'

export type ProgressRingProps = {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  valueText?: ReactNode
  className?: string
}

export const ProgressRing = ({
  value,
  max = 100,
  size = 72,
  strokeWidth = 6,
  color = 'var(--accent)',
  trackColor = 'rgba(255, 255, 255, 0.1)',
  label,
  valueText,
  className,
}: ProgressRingProps) => {
  const safeMax = Math.max(max, 1)
  const normalizedValue = Math.min(Math.max(value, 0), safeMax)
  const percentage = Math.round((normalizedValue / safeMax) * 100)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedValue / safeMax) * circumference

  return (
    <div className={`ui-progress-ring ${className ?? ''}`.trim()} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Progress: ${percentage}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          className="ui-progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="ui-progress-ring-content">
        <span className="ui-progress-ring-value">{valueText ?? `${percentage}%`}</span>
        {label && <span className="ui-progress-ring-label">{label}</span>}
      </div>
    </div>
  )
}

import { useState } from 'react'
import './Charts.css'

export type DonutSegment = {
  id: string
  label: string
  value: number
  color: string
}

export type DonutChartProps = {
  data: DonutSegment[]
  size?: number
  strokeWidth?: number
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string | number
  className?: string
  onSegmentClick?: (segment: DonutSegment) => void
}

export const DonutChart = ({
  data,
  size = 140,
  strokeWidth = 16,
  showLegend = true,
  centerLabel,
  centerValue,
  className,
  onSegmentClick,
}: DonutChartProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const validData = data.filter((d) => d.value > 0)
  const total = validData.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return null
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const computedSegments = validData.map((segment, index) => {
    const percent = segment.value / total
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`
    const priorPercent = validData.slice(0, index).reduce((sum, item) => sum + item.value / total, 0)
    const strokeDashoffset = -circumference * priorPercent
    return {
      ...segment,
      percent,
      strokeDasharray,
      strokeDashoffset,
    }
  })

  return (
    <div className={`ui-donut-chart ${className ?? ''}`.trim()}>
      <div className="ui-progress-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel ?? 'Donut chart'}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={strokeWidth} opacity={0.4} />
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {computedSegments.map((segment) => {
              const isHovered = hoveredId === segment.id

              return (
                <circle
                  key={segment.id}
                  className="ui-donut-slice"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  onMouseEnter={() => setHoveredId(segment.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(segment.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => onSegmentClick?.(segment)}
                  tabIndex={0}
                  role={onSegmentClick ? 'button' : undefined}
                  style={{
                    strokeWidth: isHovered ? strokeWidth + 4 : strokeWidth,
                    opacity: hoveredId !== null && !isHovered ? 0.45 : 1,
                  }}
                >
                  <title>{`${segment.label}: ${segment.value} (${Math.round(segment.percent * 100)}%)`}</title>
                </circle>
              )
            })}
          </g>
        </svg>

        <div className="ui-progress-ring-content">
          <span className="ui-progress-ring-value">
            {hoveredId ? validData.find((d) => d.id === hoveredId)?.value : (centerValue ?? total)}
          </span>
          <span className="ui-progress-ring-label">
            {hoveredId ? validData.find((d) => d.id === hoveredId)?.label : (centerLabel ?? 'всего')}
          </span>
        </div>
      </div>

      {showLegend && (
        <div className="ui-chart-legend">
          {validData.map((segment) => (
            <div
              key={segment.id}
              className="ui-chart-legend-item"
              onMouseEnter={() => setHoveredId(segment.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSegmentClick?.(segment)}
              style={{
                opacity: hoveredId !== null && hoveredId !== segment.id ? 0.5 : 1,
              }}
            >
              <span className="ui-chart-legend-dot" style={{ background: segment.color }} />
              <span>{segment.label}</span>
              <strong style={{ marginLeft: 'auto', paddingLeft: '8px' }}>{segment.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

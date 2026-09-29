import { useState, type ReactNode } from 'react'
import './Charts.css'

export type BarChartItem = {
  id?: string
  label: string
  value: number
  color?: string
  subLabel?: string
}

export type BarChartProps = {
  data: BarChartItem[]
  height?: number
  formatValue?: (value: number) => string
  title?: ReactNode
  subtitle?: ReactNode
  className?: string
  barColor?: string
  showValues?: boolean
  onBarClick?: (item: BarChartItem, index: number) => void
}

export const BarChart = ({
  data,
  height = 160,
  formatValue = (val) => String(val),
  title,
  subtitle,
  className,
  barColor = 'var(--accent)',
  showValues = true,
  onBarClick,
}: BarChartProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return null
  }

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 0.0001)

  const chartHeight = height - 40
  const paddingX = 24
  const chartWidth = Math.max(data.length * 52, 300)
  const availableWidth = chartWidth - paddingX * 2
  const barWidth = Math.max(Math.min(availableWidth / data.length - 8, 36), 14)
  const gap = data.length > 1 ? Math.max((availableWidth - barWidth * data.length) / (data.length - 1), 4) : 0

  return (
    <div className={`ui-chart-container ${className ?? ''}`.trim()}>
      {(title || subtitle) && (
        <div className="ui-chart-header">
          {title && (typeof title === 'string' ? <h4 className="ui-chart-title">{title}</h4> : title)}
          {subtitle && (typeof subtitle === 'string' ? <span className="ui-chart-subtitle">{subtitle}</span> : subtitle)}
        </div>
      )}

      <div className="ui-barchart-scroll">
        <svg
          className="ui-barchart-svg"
          viewBox={`0 0 ${chartWidth} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bar chart"
        >
          <line x1={paddingX / 2} y1={height - 24} x2={chartWidth - paddingX / 2} y2={height - 24} stroke="var(--line)" strokeWidth="1" />

          {data.map((item, index) => {
            const barHeight = Math.max((item.value / maxValue) * (chartHeight - 16), item.value > 0 ? 4 : 0)
            const x = data.length === 1 ? (chartWidth - barWidth) / 2 : paddingX + index * (barWidth + gap)
            const y = height - 24 - barHeight
            const isHovered = hoveredIdx === index
            const fill = item.color || barColor

            return (
              <g
                key={item.id ?? `${item.label}-${index}`}
                className="ui-barchart-group"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onBarClick?.(item, index)}
              >
                {showValues && item.value > 0 && (
                  <text x={x + barWidth / 2} y={y - 6} className="ui-barchart-value" style={{ opacity: isHovered ? 1 : 0.8 }}>
                    {formatValue(item.value)}
                  </text>
                )}

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={fill}
                  rx={2}
                  className="ui-barchart-bar"
                  style={{
                    opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                  }}
                >
                  <title>{`${item.label}: ${formatValue(item.value)}${item.subLabel ? ` (${item.subLabel})` : ''}`}</title>
                </rect>

                <text x={x + barWidth / 2} y={height - 18} className="ui-barchart-label">
                  {item.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

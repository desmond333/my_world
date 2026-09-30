import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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

const PAD_X = 10
const PAD_TOP = 18
const LABEL_BAND = 24
const MIN_SLOT = 30
const MAX_BAR = 44
const GRID_STEPS = 3

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

const niceMax = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 1
  const exp = Math.floor(Math.log10(value))
  const base = 10 ** exp
  const scaled = value / base
  const step = NICE_STEPS.find((candidate) => scaled <= candidate + 1e-9) ?? 10
  return step * base
}

const fitLabel = (text: string, slot: number) => {
  const maxChars = Math.max(1, Math.floor((slot - 4) / 6.4))
  return text.length > maxChars ? `${text.slice(0, Math.max(1, maxChars - 1))}…` : text
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [measuredWidth, setMeasuredWidth] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setMeasuredWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!data || data.length === 0) {
    return null
  }

  const plotHeight = Math.max(height - PAD_TOP - LABEL_BAND, 24)
  const minWidth = Math.max(data.length * MIN_SLOT, 200)
  const width = Math.max(measuredWidth || minWidth, minWidth)

  const slot = (width - PAD_X * 2) / data.length
  const barWidth = clamp(slot - 10, 6, MAX_BAR)
  const maxValue = niceMax(Math.max(...data.map((item) => Math.abs(item.value)), 0))
  const valuesFit = showValues && slot >= 34

  const ticks = Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
    const ratio = index / GRID_STEPS
    return { ratio, y: PAD_TOP + plotHeight - ratio * plotHeight, value: maxValue * ratio }
  })

  return (
    <div className={`ui-chart-container ${className ?? ''}`.trim()}>
      {(title || subtitle) && (
        <div className="ui-chart-header">
          {title && (typeof title === 'string' ? <h4 className="ui-chart-title">{title}</h4> : title)}
          {subtitle && (typeof subtitle === 'string' ? <span className="ui-chart-subtitle">{subtitle}</span> : subtitle)}
        </div>
      )}

      <div className="ui-barchart-scroll" ref={scrollRef}>
        <svg
          className="ui-barchart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={typeof title === 'string' ? title : 'Bar chart'}
        >
          {ticks.map((tick) => (
            <line key={tick.ratio} className="ui-barchart-grid-line" x1={PAD_X} x2={width - PAD_X} y1={tick.y} y2={tick.y} />
          ))}

          {data.map((item, index) => {
            const ratio = maxValue > 0 ? Math.min(Math.abs(item.value) / maxValue, 1) : 0
            const barHeight = item.value === 0 ? 0 : Math.max(ratio * plotHeight, 3)
            const x = PAD_X + index * slot + (slot - barWidth) / 2
            const y = PAD_TOP + plotHeight - barHeight
            const isHovered = hoveredIdx === index
            const fill = item.color || barColor

            return (
              <g
                key={item.id ?? `${item.label}-${index}`}
                className={`ui-barchart-group${onBarClick ? ' is-clickable' : ''}`}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(index)}
                onBlur={() => setHoveredIdx(null)}
                onClick={() => onBarClick?.(item, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onBarClick?.(item, index)
                  }
                }}
                tabIndex={onBarClick ? 0 : undefined}
                role={onBarClick ? 'button' : undefined}
              >
                <rect
                  className="ui-barchart-slot"
                  x={PAD_X + index * slot}
                  y={PAD_TOP}
                  width={slot}
                  height={plotHeight + LABEL_BAND}
                  fill="transparent"
                />

                {valuesFit && item.value > 0 && (
                  <text x={x + barWidth / 2} y={y - 6} className="ui-barchart-value" style={{ opacity: isHovered ? 1 : 0.75 }}>
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
                  style={{ opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1 }}
                >
                  <title>{`${item.label}: ${formatValue(item.value)}${item.subLabel ? ` (${item.subLabel})` : ''}`}</title>
                </rect>

                <text x={PAD_X + index * slot + slot / 2} y={PAD_TOP + plotHeight + 8} className="ui-barchart-label">
                  {fitLabel(item.label, slot)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

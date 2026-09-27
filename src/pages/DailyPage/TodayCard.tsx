import { formatClock, formatDay, formatMonth, seasonPhrase } from '../../lib'
import type { TodayCardProps } from './types'

export const TodayCard = ({ now, timezone, zone, season }: TodayCardProps) => (
  <div className="today-card">
    <div className="card-kicker">сегодня</div>
    <div className="big-date">{formatDay(now, timezone)}</div>
    <div className="today-month">{formatMonth(now, timezone)}</div>
    <div className="season-line">{seasonPhrase(season)}</div>
    <div className="time">
      <span className="live-dot" /> {formatClock(now, timezone)} <small>{zone}</small>
    </div>
  </div>
)

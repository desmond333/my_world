import { SECOND_MS, useNow } from '../../hooks'
import { formatClock, formatDay, formatMonth, seasonPhrase } from '../../lib'
import type { TodayCardProps } from './types'

export const TodayCard = ({ timezone, zone, season }: TodayCardProps) => {
  const now = useNow(SECOND_MS)

  return (
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
}

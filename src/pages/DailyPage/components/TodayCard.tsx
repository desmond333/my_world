import { SECOND_MS, useNow } from '../../../hooks'
import { formatClock, formatDay, formatMonth, seasonPhrase } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import type { TodayCardProps } from '../types'

export const TodayCard = ({ timezone, zone, season }: TodayCardProps) => {
  const { lang, t, locale } = useTranslation()
  const now = useNow(SECOND_MS)

  return (
    <div className="today-card">
      <div className="card-kicker">{t('common.today')}</div>
      <div className="big-date">{formatDay(now, timezone, locale)}</div>
      <div className="today-month">{formatMonth(now, timezone, locale)}</div>
      <div className="season-line">{seasonPhrase(season, lang)}</div>
      <div className="time">
        <span className="live-dot" /> {formatClock(now, timezone, locale)} <small>{zone}</small>
      </div>
    </div>
  )
}

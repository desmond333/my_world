import { Cake, Flower2, Shield, Sparkles, Star } from 'lucide-react'
import { WeatherIcon } from '../../../shared/ui'
import { TEMP_BANDS, dayMonth, dayName, getDaySpecialEvent, getTemperatureColor, isRainyDay, weatherLabel } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { useBirthdayStore } from '../../../store'
import type { ForecastStripProps } from '../types'

export const SpecialEventIcon = ({ kind }: { kind: string }) => {
  switch (kind) {
    case 'cake':
      return <Cake size={13} className="forecast-badge-icon" />
    case 'flower':
      return <Flower2 size={13} className="forecast-badge-icon" />
    case 'shield':
      return <Shield size={13} className="forecast-badge-icon" />
    case 'star':
      return <Star size={13} className="forecast-badge-icon" />
    case 'sparkles':
    default:
      return <Sparkles size={13} className="forecast-badge-icon" />
  }
}

export const ForecastStrip = ({ forecast }: ForecastStripProps) => {
  const { lang, t, locale } = useTranslation()
  const ownBirthday = useBirthdayStore((state) => state.ownBirthday)
  const birthdays = useBirthdayStore((state) => state.birthdays)

  return (
    <div className="forecast-section">
      <section className="forecast-strip" id="forecast-strip" aria-label={t('daily.forecastAria')}>
        {forecast.map((day, index) => {
          const tempColor = getTemperatureColor(day.max)
          const rainAlert = isRainyDay(day.code)
          const event = getDaySpecialEvent(day.date, ownBirthday, birthdays)
          const eventTitle = event ? t(event.titleKey, event.titleFallback, event.titleParams) : ''

          return (
            <div
              className={`forecast-day${index === 0 ? ' is-today' : ''}`}
              key={day.date}
              style={{ borderBottom: `4px solid ${tempColor}` }}
            >
              <div className="forecast-day-top">
                <div className="forecast-day-dates">
                  <span className="forecast-name">{dayName(day.date, index, locale)}</span>
                  <span className="forecast-date">{dayMonth(day.date, locale)}</span>
                </div>
                <div className="forecast-badges">
                  {rainAlert && (
                    <span className="forecast-rain-alert" title={t('weather.rainAlert')} aria-label={t('weather.rainAlert')}>
                      !
                    </span>
                  )}
                  {event && (
                    <span className={`forecast-event-badge is-${event.type}`} title={eventTitle} aria-label={eventTitle}>
                      <SpecialEventIcon kind={event.kind} />
                    </span>
                  )}
                </div>
              </div>

              <WeatherIcon code={day.code} size={24} strokeWidth={1.5} className="forecast-icon" />
              <span className="forecast-label">{weatherLabel(day.code, lang)}</span>
              <div className="forecast-temps">
                <strong style={{ color: tempColor }}>{day.max}°</strong>
                <span>{day.min}°</span>
              </div>
            </div>
          )
        })}
      </section>

      <div className="forecast-legend" aria-hidden="true">
        {TEMP_BANDS.map((band) => (
          <span className="forecast-legend-item" key={band.id}>
            <i style={{ background: band.color }} />
            {lang === 'en' ? band.labelEn : band.labelRu}
          </span>
        ))}
      </div>
    </div>
  )
}

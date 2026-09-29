import { ChevronDown, MapPin, RefreshCw, Wind } from 'lucide-react'
import { WeatherIcon } from '../../../components/WeatherIcon/WeatherIcon'
import { dayName, weatherLabel } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import type { WeatherCardProps } from '../types'

export const WeatherCard = ({ cityName, weather, forecast, failed, open, onToggle }: WeatherCardProps) => {
  const { lang, t, locale } = useTranslation()

  return (
    <div className="weather-card">
      <div className="card-kicker">
        <MapPin size={13} /> {cityName}
      </div>
      {weather ? (
        <>
          <div className="weather-main">
            <WeatherIcon code={weather.weathercode} size={31} strokeWidth={1.5} />
            <strong>{weather.temperature}°</strong>
            <span className="weather-now">{t('weather.now')}</span>
          </div>
          <p>{weatherLabel(weather.weathercode, lang)}</p>
          <div className="weather-meta">
            <span>
              <Wind size={14} /> {weather.windspeed} {t('weather.kmh')}
            </span>
          </div>
          <div className="weather-two-days">
            {forecast.slice(0, 2).map((day, index) => (
              <div className="two-day" key={day.date}>
                <span className="two-day-name">{dayName(day.date, index, locale)}</span>
                <div className="two-day-main">
                  <WeatherIcon code={day.code} size={19} strokeWidth={1.6} />
                  <strong>{day.max}°</strong>
                  <span>{day.min}°</span>
                </div>
                <span className="two-day-note">{weatherLabel(day.code, lang)}</span>
              </div>
            ))}
          </div>
          <button className="forecast-toggle" onClick={onToggle} aria-expanded={open} aria-controls="forecast-strip">
            {open ? t('weather.collapse') : t('weather.showWeek')} <ChevronDown size={15} className={open ? 'chevron-up' : ''} />
          </button>
        </>
      ) : (
        <div className="weather-loading">
          {failed ? t('weather.failed') : <RefreshCw size={16} className="spin" />}
          {!failed && t('weather.loading')}
        </div>
      )}
    </div>
  )
}

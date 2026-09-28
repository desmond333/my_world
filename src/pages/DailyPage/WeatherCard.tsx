import { ChevronDown, MapPin, RefreshCw, Wind } from 'lucide-react'
import { WeatherIcon } from '../../components/WeatherIcon/WeatherIcon'
import { dayName, weatherLabel } from '../../lib'
import type { WeatherCardProps } from './types'

export const WeatherCard = ({ cityName, weather, forecast, failed, open, onToggle }: WeatherCardProps) => (
  <div className="weather-card">
    <div className="card-kicker">
      <MapPin size={13} /> {cityName}
    </div>
    {weather ? (
      <>
        <div className="weather-main">
          <WeatherIcon code={weather.weathercode} size={31} strokeWidth={1.5} />
          <strong>{weather.temperature}°</strong>
          <span className="weather-now">сейчас</span>
        </div>
        <p>{weatherLabel(weather.weathercode)}</p>
        <div className="weather-meta">
          <span>
            <Wind size={14} /> {weather.windspeed} км/ч
          </span>
        </div>
        <div className="weather-two-days">
          {forecast.slice(0, 2).map((day, index) => (
            <div className="two-day" key={day.date}>
              <span className="two-day-name">{dayName(day.date, index)}</span>
              <div className="two-day-main">
                <WeatherIcon code={day.code} size={19} strokeWidth={1.6} />
                <strong>{day.max}°</strong>
                <span>{day.min}°</span>
              </div>
              <span className="two-day-note">{weatherLabel(day.code)}</span>
            </div>
          ))}
        </div>
        <button className="forecast-toggle" onClick={onToggle} aria-expanded={open} aria-controls="forecast-strip">
          {open ? 'Свернуть прогноз' : 'Показать 7 дней'} <ChevronDown size={15} className={open ? 'chevron-up' : ''} />
        </button>
      </>
    ) : (
      <div className="weather-loading">
        {failed ? 'Погода недоступна' : <RefreshCw size={16} className="spin" />}
        {!failed && 'загружаем...'}
      </div>
    )}
  </div>
)

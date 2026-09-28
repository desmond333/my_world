import { WeatherIcon } from '../../components/WeatherIcon/WeatherIcon'
import { dayMonth, dayName, weatherLabel } from '../../lib'
import type { ForecastStripProps } from './types'

export const ForecastStrip = ({ forecast }: ForecastStripProps) => (
  <section className="forecast-strip" id="forecast-strip" aria-label="Прогноз погоды на неделю">
    {forecast.map((day, index) => (
      <div className={`forecast-day${index === 0 ? ' is-today' : ''}`} key={day.date}>
        <span className="forecast-name">{dayName(day.date, index)}</span>
        <span className="forecast-date">{dayMonth(day.date)}</span>
        <WeatherIcon code={day.code} size={24} strokeWidth={1.5} className="forecast-icon" />
        <span className="forecast-label">{weatherLabel(day.code)}</span>
        <div className="forecast-temps">
          <strong>{day.max}°</strong>
          <span>{day.min}°</span>
        </div>
      </div>
    ))}
  </section>
)

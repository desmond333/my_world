export type Weather = { temperature: number; windspeed: number; weathercode: number }

export type DayForecast = { date: string; code: number; max: number; min: number }

export type WeatherBundle = { weather: Weather; forecast: DayForecast[] }

type OpenMeteoResponse = {
  current: { temperature_2m: number; windspeed_10m: number; weather_code: number }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] }
}

const buildWeatherUrl = (latitude: number, longitude: number, timezone: string) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,windspeed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=${encodeURIComponent(timezone)}`

export const fetchWeather = async (latitude: number, longitude: number, timezone: string, signal?: AbortSignal): Promise<WeatherBundle> => {
  const response = await fetch(buildWeatherUrl(latitude, longitude, timezone), { signal })
  if (!response.ok) throw new Error('weather')
  const data = (await response.json()) as OpenMeteoResponse
  return {
    weather: {
      temperature: Math.round(data.current.temperature_2m),
      windspeed: Math.round(data.current.windspeed_10m),
      weathercode: data.current.weather_code,
    },
    forecast: data.daily.time.map((date, index) => ({
      date,
      code: data.daily.weather_code[index],
      max: Math.round(data.daily.temperature_2m_max[index]),
      min: Math.round(data.daily.temperature_2m_min[index]),
    })),
  }
}

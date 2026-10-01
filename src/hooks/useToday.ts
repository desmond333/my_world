import { findCity } from '../data'
import { getDateForTimezone, useDailyStore } from '../store'

export const useToday = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const city = findCity(cityId)

  return {
    city,
    timezone: city.timezone,
    today: getDateForTimezone(city.timezone),
  }
}

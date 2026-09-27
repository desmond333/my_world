export type Holiday = { date: string; localName: string; name: string }

const countryForCity = (cityId: string) => (cityId === 'tbilisi' ? 'GE' : 'RU')

export const fetchHoliday = async (date: string, cityId: string, signal?: AbortSignal): Promise<Holiday | null> => {
  const year = date.slice(0, 4)
  const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryForCity(cityId)}`, { signal })
  if (!response.ok) throw new Error('holiday')
  const holidays = (await response.json()) as Holiday[]
  return holidays.find((item) => item.date === date) ?? null
}

export const getSeason = (date: Date, timezone: string) => {
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'numeric' }).format(date))
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export const seasonName = (season: string, lang: 'ru' | 'en' = 'ru') => {
  if (lang === 'en') {
    return season === 'spring' ? 'spring' : season === 'summer' ? 'summer' : season === 'autumn' ? 'autumn' : 'winter'
  }
  return season === 'spring' ? 'весенняя' : season === 'summer' ? 'летняя' : season === 'autumn' ? 'осенняя' : 'зимняя'
}

export const seasonPhrase = (season: string, lang: 'ru' | 'en' = 'ru') => {
  if (lang === 'en') {
    return (
      {
        spring: 'gentle spring',
        summer: 'beautiful summer',
        autumn: 'golden autumn',
        winter: 'crisp winter',
      }[season] ?? season
    )
  }
  return (
    {
      spring: 'нежная весна',
      summer: 'прекрасное лето',
      autumn: 'золотая осень',
      winter: 'красивая зима',
    }[season] ?? season
  )
}

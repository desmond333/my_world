import type { CollectionDetailFact, CollectionDetails } from '../../../../data'
import type { MovieDetails } from '../../../../services'

const regionNames = new Intl.DisplayNames(['ru'], { type: 'region' })

const countryName = (iso: string, fallback: string) => {
  try {
    return regionNames.of(iso) ?? fallback
  } catch {
    return fallback
  }
}

const countriesLabel = (details: MovieDetails) => {
  if (details.countries.length === 0) return ''
  return details.countries.map((country) => countryName(country.iso_3166_1, country.name)).join(', ')
}

const releaseLabel = (value: string) => {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return year
  return `${day}.${month}.${year}`
}

const moneyLabel = (value: number | null) => {
  if (value === null) return ''
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.', ',')} млрд $`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')} млн $`
  return `${value.toLocaleString('ru-RU')} $`
}

const runtimeLabel = (minutes: number | null) => {
  if (minutes === null) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} мин`
  if (rest === 0) return `${hours} ч`
  return `${hours} ч ${rest} мин`
}

const fact = (label: string, value: string): CollectionDetailFact | null => (value.trim() ? { label, value } : null)

const collectFacts = (details: MovieDetails): CollectionDetailFact[] =>
  [
    fact('Страна', countriesLabel(details)),
    fact('Жанры', details.genres.join(', ')),
    fact('Длительность', runtimeLabel(details.runtimeMinutes)),
    fact('Премьера', releaseLabel(details.releaseDate)),
    fact('Оригинал', details.originalTitle),
    fact('Рейтинг', details.score ? `★ ${details.score}` : ''),
    fact('Оценок', details.votes ? details.votes.toLocaleString('ru-RU') : ''),
    fact('Бюджет', moneyLabel(details.budget)),
    fact('Сборы', moneyLabel(details.revenue)),
    fact('Язык оригинала', details.originalLanguage.toUpperCase()),
  ].filter((item): item is CollectionDetailFact => item !== null)

const collectLinks = (details: MovieDetails) => {
  const links: CollectionDetails['links'] = []
  if (details.homepage) links.push({ label: 'Официальный сайт', href: details.homepage })
  if (details.imdbId) links.push({ label: 'IMDb', href: `https://www.imdb.com/title/${details.imdbId}/` })
  return links
}

export const toCollectionDetails = (details: MovieDetails): CollectionDetails => ({
  tagline: details.tagline,
  facts: collectFacts(details),
  overview: details.overview,
  links: collectLinks(details),
})

import type { Animal, Favorite } from '../../data'
import { findAnimal } from '../animal'
import { formatAddedAt } from '../date'
import { getTranslation, type Lang } from '../i18n'

export const favoritesReport = (animals: Animal[], favorites: Favorite[], locale: string = 'ru-RU', lang: Lang = 'ru') => {
  const label = (key: string) => getTranslation(key, lang)
  const lines = [`${label('favorites.report.title')} — ${favorites.length}`, '']
  favorites.forEach((favorite, index) => {
    const animal = findAnimal(animals, favorite.id, favorite.name, favorite.breed)
    lines.push(`${index + 1}. ${favorite.name} — ${favorite.breed}`)
    if (animal) {
      lines.push(`   ${label('favorites.report.weight')}: ${animal.weight} · ${label('favorites.report.lifespan')}: ${animal.lifespan}`)
      lines.push(`   ${label('favorites.report.habitat')}: ${animal.habitat}`)
      lines.push(`   ${label('favorites.report.article')}: ${animal.wikiUrl}`)
    }
    lines.push(`   ${label('favorites.report.added')}: ${formatAddedAt(favorite.addedAt, locale)}`)
  })
  return lines.join('\n')
}

import type { Animal, Favorite } from '../data'
import { findAnimal } from './animal'

const formatAddedAt = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const favoritesReport = (animals: Animal[], favorites: Favorite[]) => {
  const lines = [`Мои любимцы — ${favorites.length}`, '']
  favorites.forEach((favorite, index) => {
    const animal = findAnimal(animals, favorite.id, favorite.name, favorite.breed)
    lines.push(`${index + 1}. ${favorite.name} — ${favorite.breed}`)
    if (animal) {
      lines.push(`   Вес: ${animal.weight} · Живёт: ${animal.lifespan}`)
      lines.push(`   Обитает: ${animal.habitat}`)
      lines.push(`   Статья: ${animal.wikiUrl}`)
    }
    lines.push(`   Добавлено: ${formatAddedAt(favorite.addedAt)}`)
  })
  return lines.join('\n')
}

export { formatAddedAt }

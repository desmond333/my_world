import type { CollectionDescriptor } from '../../../../widgets/Collection'
import type { CollectionListOption } from '../../../../data'
import { MIN_GAMES_QUERY_LENGTH, fetchGameDetails, isRawgConfigured, searchGames } from '../../../../services'

const lists: CollectionListOption[] = [
  { key: 'wishlist', label: 'Хочу сыграть', hint: 'в планах' },
  { key: 'watched', label: 'Пройденные', hint: 'уже сыграл' },
]

export const gamesCollection: CollectionDescriptor = {
  kicker: 'дополнительно',
  heading: 'Игры',
  intro:
    'Ищи игры по названию на английском языке (например: Witcher, Cyberpunk, Elden Ring), раскладывай в два списка и меняй порядок перетаскиванием.',
  lists,
  search: {
    kicker: 'rawg',
    panelTitle: 'Найди игру (на английском)',
    fieldLabel: 'Название игры на английском',
    placeholder: 'Например: Witcher, Cyberpunk, Elden Ring, Portal',
    minLength: MIN_GAMES_QUERY_LENGTH,
    configured: true,
    notConfiguredHint: isRawgConfigured()
      ? ''
      : 'RAWG API не настроен: укажи VITE_RAWG_API_KEY в .env. Поиск работает по локальной базе шедевров на английском языке.',
    run: searchGames,
    details: {
      label: 'Подробнее',
      load: fetchGameDetails,
    },
    online: {
      label: 'Искать в сети',
      href: (title: string) => `https://www.google.com/search?q=${encodeURIComponent(`${title} game`)}`,
    },
  },
}

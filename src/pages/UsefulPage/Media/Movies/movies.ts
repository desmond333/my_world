import type { CollectionDescriptor } from '../../../../widgets/Collection'
import type { CollectionListOption } from '../../../../data'
import { onlineSearchUrl } from '../../../../lib'
import { MISSING_KEY_MESSAGE, MIN_QUERY_LENGTH, fetchMovieDetails, isTmdbConfigured, searchMovies } from '../../../../services'
import { toCollectionDetails } from './movieDetails'

const lists: CollectionListOption[] = [
  { key: 'wishlist', label: 'Хочу посмотреть', hint: 'что ещё впереди' },
  { key: 'watched', label: 'Просмотренные', hint: 'что уже видел' },
]

export const moviesCollection: CollectionDescriptor = {
  kicker: 'дополнительно',
  heading: 'Фильмы',
  intro: 'Ищи по названию, раскладывай в два списка и меняй порядок перетаскиванием. Всё хранится только на этом устройстве.',
  lists,
  search: {
    kicker: 'tmdb',
    panelTitle: 'Найди фильм',
    fieldLabel: 'Название фильма',
    placeholder: 'Например: улица',
    minLength: MIN_QUERY_LENGTH,
    configured: isTmdbConfigured(),
    notConfiguredHint: `${MISSING_KEY_MESSAGE} Списки ниже хранятся на устройстве и работают без ключа.`,
    run: searchMovies,
    details: {
      label: 'Подробнее',
      load: async (id, signal) => toCollectionDetails(await fetchMovieDetails(id, signal)),
    },
    online: { label: 'Смотреть онлайн', href: onlineSearchUrl },
  },
}

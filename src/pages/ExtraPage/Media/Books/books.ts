import type { CollectionDescriptor } from '../../../../components/Collection/types'
import type { CollectionListOption } from '../../../../data'
import { onlineSearchUrl } from '../../../../lib'
import { MIN_BOOKS_QUERY_LENGTH, fetchBookDetails, searchBooks } from '../../../../services'

const lists: CollectionListOption[] = [
  { key: 'wishlist', label: 'Хочу прочитать', hint: 'в планах' },
  { key: 'watched', label: 'Прочитанные', hint: 'уже прочитано' },
]

export const booksCollection: CollectionDescriptor = {
  kicker: 'дополнительно',
  heading: 'Книги',
  intro:
    'Ищи книги по названию или автору на русском языке, раскладывай в два списка и меняй порядок перетаскиванием. Всё хранится только на этом устройстве.',
  lists,
  search: {
    kicker: 'google books',
    panelTitle: 'Найди книгу',
    fieldLabel: 'Название или автор книги',
    placeholder: 'Например: Мастер и Маргарита, Достоевский, 1984',
    minLength: MIN_BOOKS_QUERY_LENGTH,
    configured: true,
    notConfiguredHint: 'Поиск работает через Google Books API или по встроенной базе книг на русском языке.',
    run: searchBooks,
    details: {
      label: 'Подробнее',
      load: fetchBookDetails,
    },
    online: {
      label: 'Читать онлайн',
      href: (title: string) => onlineSearchUrl(title, 'читать онлайн'),
    },
  },
}

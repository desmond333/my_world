import { BookOpen } from 'lucide-react'
import { ComingSoon } from '../../../../components/ComingSoon/ComingSoon'

export const BooksPage = () => (
  <ComingSoon
    icon={BookOpen}
    kicker="медиа · книги"
    heading="Книги"
    description="Поиск по названию, два списка «Читаю» и «Прочитал», фильтры по жанрам и годам — по образцу фильмов."
  />
)

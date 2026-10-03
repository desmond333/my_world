import { BookOpen } from 'lucide-react'
import { CollectionView } from '../../../../widgets/Collection'
import { useTranslation } from '../../../../lib/i18n'
import { useBooksStore } from '../../../../store'
import { booksCollection } from './books'

export const BooksPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <section className="useful-head">
        <p className="eyebrow">
          <BookOpen size={15} /> {t('books.kicker', booksCollection.kicker)}
        </p>
        <h1>{t('books.title', booksCollection.heading)}</h1>
        <p className="intro">{t('books.intro', booksCollection.intro)}</p>
      </section>
      <CollectionView descriptor={booksCollection} store={useBooksStore} />
    </>
  )
}

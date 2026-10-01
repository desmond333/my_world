import { Clapperboard } from 'lucide-react'
import { CollectionView } from '../../../../widgets/Collection'
import { useTranslation } from '../../../../lib/i18n'
import { useMoviesStore } from '../../../../store'
import { moviesCollection } from './movies'

export const MoviesPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Clapperboard size={15} /> {t('movies.kicker', moviesCollection.kicker)}
        </p>
        <h1>{t('movies.title', moviesCollection.heading)}</h1>
        <p className="intro">{t('movies.intro', moviesCollection.intro)}</p>
      </section>
      <CollectionView descriptor={moviesCollection} store={useMoviesStore} />
    </>
  )
}

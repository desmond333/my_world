import { Clapperboard } from 'lucide-react'
import { CollectionView } from '../../../../components/Collection/CollectionView'
import { useMoviesStore } from '../../../../store'
import { moviesCollection } from './movies'

export const MoviesPage = () => (
  <>
    <section className="extra-head">
      <p className="eyebrow">
        <Clapperboard size={15} /> {moviesCollection.kicker}
      </p>
      <h1>{moviesCollection.heading}</h1>
      <p className="intro">{moviesCollection.intro}</p>
    </section>
    <CollectionView descriptor={moviesCollection} store={useMoviesStore} />
  </>
)

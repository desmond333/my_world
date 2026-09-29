import { Gamepad2 } from 'lucide-react'
import { CollectionView } from '../../../../components/Collection/CollectionView'
import { useTranslation } from '../../../../lib/i18n'
import { useGamesStore } from '../../../../store'
import { gamesCollection } from './games'

export const GamesPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Gamepad2 size={15} /> {t('games.kicker', gamesCollection.kicker)}
        </p>
        <h1>{t('games.title', gamesCollection.heading)}</h1>
        <p className="intro">{t('games.intro', gamesCollection.intro)}</p>
      </section>
      <CollectionView descriptor={gamesCollection} store={useGamesStore} />
    </>
  )
}

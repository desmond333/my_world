import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin, Scale, Sparkles, Star, Timer } from 'lucide-react'
import { AppFooter, AppTopbar } from '../../widgets'
import { findAnimal, formatAddedAt } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { useAnimalsStore, useFavoritesStore } from '../../store'
import './AnimalPage.css'

export const AnimalPage = () => {
  const { t, locale } = useTranslation()
  const { id = '' } = useParams()
  const animals = useAnimalsStore((state) => state.animals)
  const favorites = useFavoritesStore((state) => state.favorites)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)

  const stored = favorites.find((favorite) => favorite.id === id)
  const animal = findAnimal(animals, id, stored?.name, stored?.breed)

  if (!animal)
    return (
      <main className="page-shell">
        <section className="favorites-empty">
          <h2>{t('animalPage.notFound')}</h2>
          <p>{t('animalPage.notFoundNote')}</p>
          <Link className="add-button" to="/today">
            {t('common.home')}
          </Link>
        </section>
      </main>
    )

  const isFavorite = favorites.some((favorite) => favorite.id === animal.id)
  const addedAt = stored?.addedAt

  return (
    <main className="page-shell">
      <AppTopbar />

      <Link className="back-link" to="/favorites">
        <ArrowLeft size={15} /> {t('animalPage.backToFavorites')}
      </Link>

      <section className="animal-hero">
        <div className="animal-photo">
          <img src={animal.image} alt={animal.alt} />
          <span className="photo-tag">{animal.species}</span>
        </div>
        <div className="animal-intro">
          <p className="eyebrow">
            <Sparkles size={15} /> {t('animal.aboutSpecies')}
          </p>
          <h1>{animal.name}</h1>
          <p className="animal-breed-line">{animal.breed}</p>
          <blockquote>«{animal.phrase}»</blockquote>
          <div className="animal-actions">
            <button
              className={`favorite-button${isFavorite ? ' is-active' : ''}`}
              onClick={() => (isFavorite ? removeFavorite(animal.id) : addFavorite(animal))}
              aria-pressed={isFavorite}
            >
              <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />{' '}
              {isFavorite ? t('animal.inFavorites') : t('animal.addFavorite')}
            </button>
            <a className="add-button wiki-link" href={animal.wikiUrl} target="_blank" rel="noreferrer noopener">
              <ExternalLink size={15} /> {t('animalPage.wikiLink')}
            </a>
          </div>
          {addedAt && (
            <div className="favorite-added animal-added">
              <span className="live-dot" /> {t('animalPage.addedAt', undefined, { date: formatAddedAt(addedAt, locale) })}
            </div>
          )}
        </div>
      </section>

      <section className="animal-specs" aria-label={t('animalPage.specsAria')}>
        <div className="spec">
          <Scale size={19} strokeWidth={1.5} />
          <span>{t('animalPage.weight')}</span>
          <strong>{animal.weight}</strong>
        </div>
        <div className="spec">
          <Timer size={19} strokeWidth={1.5} />
          <span>{t('animalPage.lifespan')}</span>
          <strong>{animal.lifespan}</strong>
        </div>
        <div className="spec">
          <MapPin size={19} strokeWidth={1.5} />
          <span>{t('animalPage.habitat')}</span>
          <strong>{animal.habitat}</strong>
        </div>
      </section>

      <section className="animal-story">
        <div className="card-kicker">{t('animalPage.storyKicker')}</div>
        <h2>{t('animalPage.storyTitle', undefined, { name: animal.name })}</h2>
        <p>{animal.description}</p>
      </section>

      <AppFooter
        leftText={t('animalPage.footerNote')}
        note={
          <>
            <ExternalLink size={14} /> {t('animalPage.sourceWiki')}
          </>
        }
      />
    </main>
  )
}

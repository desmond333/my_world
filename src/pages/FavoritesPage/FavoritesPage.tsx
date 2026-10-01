import { Link } from 'react-router-dom'
import { ArrowUpRight, ClipboardCopy, Star, Trash2 } from 'lucide-react'
import { AppFooter, AppTopbar } from '../../widgets'
import { useCopyFeedback } from '../../hooks'
import { favoritesReport, formatAddedAt } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { useAnimalsStore, useFavoritesStore } from '../../store'
import './FavoritesPage.css'

export const FavoritesPage = () => {
  const { lang, t, locale } = useTranslation()
  const favorites = useFavoritesStore((state) => state.favorites)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const animals = useAnimalsStore((state) => state.animals)
  const { copied, copyFailed, copy } = useCopyFeedback()

  const copyFavorites = () => copy(favoritesReport(animals, favorites, locale, lang))

  return (
    <main className="page-shell">
      <AppTopbar />

      <section className="favorites-head">
        <p className="eyebrow">
          <Star size={15} /> {t('favorites.eyebrow')}
        </p>
        <h1>{t('favorites.title')}</h1>
        <p className="intro">{t('favorites.intro')}</p>
        {favorites.length > 0 && (
          <div className="favorites-copy">
            <button className="copy-button" onClick={copyFavorites}>
              <ClipboardCopy size={15} /> {copyFailed ? t('common.failed') : copied ? t('favorites.copied') : t('favorites.copyList')}
            </button>
          </div>
        )}
      </section>

      {favorites.length ? (
        <section className="favorites-grid" aria-label={t('favorites.gridAria')}>
          {favorites.map((favorite) => (
            <article className="favorite-card" key={favorite.id}>
              <Link
                className="favorite-open"
                to={`/animal/${favorite.id}`}
                aria-label={t('favorites.openAria', undefined, { name: favorite.name })}
              >
                <img src={favorite.image} alt={favorite.name} loading="lazy" />
                <div className="favorite-body">
                  <h2>{favorite.name}</h2>
                  <p className="favorite-breed">{favorite.breed}</p>
                  <div className="favorite-added">
                    <span className="live-dot" /> {t('favorites.added', undefined, { date: formatAddedAt(favorite.addedAt, locale) })}
                  </div>
                  <span className="favorite-open-hint">
                    <ArrowUpRight size={14} /> {t('favorites.openPage')}
                  </span>
                </div>
              </Link>
              <button
                className="favorite-remove"
                onClick={() => removeFavorite(favorite.id)}
                aria-label={t('favorites.removeAria', undefined, { name: favorite.name })}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </section>
      ) : (
        <section className="favorites-empty">
          <Star size={30} strokeWidth={1.4} />
          <h2>{t('favorites.empty')}</h2>
          <p>{t('favorites.emptyNote')}</p>
          <Link className="add-button" to="/today">
            {t('favorites.goToAnimal')}
          </Link>
        </section>
      )}

      <AppFooter
        leftText={t('favorites.footerNote')}
        note={
          <>
            <Star size={14} /> {t('favorites.footerHint')}
          </>
        }
      />
    </main>
  )
}

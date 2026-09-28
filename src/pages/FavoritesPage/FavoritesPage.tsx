import { Link } from 'react-router-dom'
import { ArrowUpRight, ClipboardCopy, Star, Trash2 } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { useCopyFeedback } from '../../hooks'
import { favoritesReport, formatAddedAt } from '../../lib'
import { useAnimalsStore, useFavoritesStore } from '../../store'
import './FavoritesPage.css'
import { CreatorNote } from '../../components/CreatorNote/CreatorNote'

export const FavoritesPage = () => {
  const favorites = useFavoritesStore((state) => state.favorites)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const animals = useAnimalsStore((state) => state.animals)
  const { copied, copyFailed, copy } = useCopyFeedback()

  const copyFavorites = () => copy(favoritesReport(animals, favorites))

  return (
    <main className="page-shell">
      <AppTopbar />

      <section className="favorites-head">
        <p className="eyebrow">
          <Star size={15} /> твоя коллекция
        </p>
        <h1>Избранное</h1>
        <p className="intro">Животные, которые тебе понравились. Нажми на карточку — откроется подробная страница вида.</p>
        {favorites.length > 0 && (
          <div className="favorites-copy">
            <button className="copy-button" onClick={copyFavorites}>
              <ClipboardCopy size={15} /> {copyFailed ? 'Не получилось' : copied ? 'Скопировано' : 'Копировать список'}
            </button>
          </div>
        )}
      </section>

      {favorites.length ? (
        <section className="favorites-grid" aria-label="Список избранных животных">
          {favorites.map((favorite) => (
            <article className="favorite-card" key={favorite.id}>
              <Link className="favorite-open" to={`/animal/${favorite.id}`} aria-label={`Открыть подробности о ${favorite.name}`}>
                <img src={favorite.image} alt={favorite.name} loading="lazy" />
                <div className="favorite-body">
                  <h2>{favorite.name}</h2>
                  <p className="favorite-breed">{favorite.breed}</p>
                  <div className="favorite-added">
                    <span className="live-dot" /> добавлено {formatAddedAt(favorite.addedAt)}
                  </div>
                  <span className="favorite-open-hint">
                    <ArrowUpRight size={14} /> открыть страницу вида
                  </span>
                </div>
              </Link>
              <button
                className="favorite-remove"
                onClick={() => removeFavorite(favorite.id)}
                aria-label={`Убрать ${favorite.name} из избранного`}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </section>
      ) : (
        <section className="favorites-empty">
          <Star size={30} strokeWidth={1.4} />
          <h2>Пока здесь пусто</h2>
          <p>Открой сегодняшнее животное и нажми «В избранное», чтобы собрать свою коллекцию.</p>
          <Link className="add-button" to="/">
            Перейти к животному дня
          </Link>
        </section>
      )}

      <footer>
        <span>коллекция хранится на этом устройстве</span>
        <span className="footer-note">
          <Star size={14} /> можно удалить в любой момент
        </span>
        <CreatorNote />
      </footer>
    </main>
  )
}

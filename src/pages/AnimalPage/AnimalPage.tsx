import { Link, NavLink, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Heart, MapPin, Scale, Sparkles, Star, Timer } from 'lucide-react'
import { findAnimal, formatAddedAt } from '../../lib'
import { useAnimalsStore, useFavoritesStore } from '../../store'
import './AnimalPage.css'

export const AnimalPage = () => {
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
          <h2>Не нашли такого животного</h2>
          <p>Похоже, ссылка устарела. Зато на главной всегда есть новое знакомство.</p>
          <Link className="add-button" to="/">
            На главную
          </Link>
        </section>
      </main>
    )

  const isFavorite = favorites.some((favorite) => favorite.id === animal.id)
  const addedAt = stored?.addedAt

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Животное дня">
          <span className="brand-mark">
            <Heart size={17} fill="currentColor" />
          </span>
          <span>животное дня</span>
        </Link>
        <div className="header-actions">
          <nav className="main-nav" aria-label="Основная навигация">
            <NavLink to="/">Сегодня</NavLink>
            <NavLink to="/favorites">Избранное{favorites.length ? ` · ${favorites.length}` : ''}</NavLink>
          </nav>
        </div>
      </header>

      <Link className="back-link" to="/favorites">
        <ArrowLeft size={15} /> назад в избранное
      </Link>

      <section className="animal-hero">
        <div className="animal-photo">
          <img src={animal.image} alt={animal.alt} />
          <span className="photo-tag">{animal.species}</span>
        </div>
        <div className="animal-intro">
          <p className="eyebrow">
            <Sparkles size={15} /> подробнее о виде
          </p>
          <h1>{animal.name}</h1>
          <p className="animal-breed-line">{animal.breed}</p>
          <p className="animal-facts">{animal.facts}</p>
          <blockquote>«{animal.phrase}»</blockquote>
          <div className="animal-actions">
            <button
              className={`favorite-button${isFavorite ? ' is-active' : ''}`}
              onClick={() => (isFavorite ? removeFavorite(animal.id) : addFavorite(animal))}
              aria-pressed={isFavorite}
            >
              <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'В избранном' : 'В избранное'}
            </button>
            <a className="add-button wiki-link" href={animal.wikiUrl} target="_blank" rel="noreferrer noopener">
              <ExternalLink size={15} /> статья в википедии
            </a>
          </div>
          {addedAt && (
            <div className="favorite-added animal-added">
              <span className="live-dot" /> добавлено в избранное {formatAddedAt(addedAt)}
            </div>
          )}
        </div>
      </section>

      <section className="animal-specs" aria-label="Характеристики животного">
        <div className="spec">
          <Scale size={19} strokeWidth={1.5} />
          <span>средний вес</span>
          <strong>{animal.weight}</strong>
        </div>
        <div className="spec">
          <Timer size={19} strokeWidth={1.5} />
          <span>продолжительность жизни</span>
          <strong>{animal.lifespan}</strong>
        </div>
        <div className="spec">
          <MapPin size={19} strokeWidth={1.5} />
          <span>где обитает</span>
          <strong>{animal.habitat}</strong>
        </div>
      </section>

      <section className="animal-story">
        <div className="card-kicker">характер и привычки</div>
        <h2>Такой он, {animal.name}</h2>
        <p>{animal.description}</p>
      </section>

      <footer>
        <span>любопытные факты о видах</span>
        <span className="footer-note">
          <ExternalLink size={14} /> источник — википедия
        </span>
      </footer>
    </main>
  )
}

import { Link } from 'react-router-dom'
import { ExternalLink, Sparkles, Star } from 'lucide-react'
import type { HeroSectionProps } from './types'

export const HeroSection = ({ animal, isFavorite, onToggleFavorite }: HeroSectionProps) => (
  <section className="hero">
    <div className="hero-copy">
      <p className="eyebrow">
        <Sparkles size={15} /> твой маленький знак на сегодня
      </p>
      <h1>
        Тебе выпало
        <br />
        <em>{animal.name}</em>
      </h1>
      <p className="intro">Одно животное. Одна мысль, которую стоит взять с собой.</p>
      <blockquote>«{animal.phrase}»</blockquote>
      <div className="hero-actions">
        <div className="signature">
          <span className="signature-line" /> с теплом, {animal.name}
        </div>
        <button className={`favorite-button${isFavorite ? ' is-active' : ''}`} onClick={onToggleFavorite} aria-pressed={isFavorite}>
          <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'В избранном' : 'В избранное'}
        </button>
        <Link className="favorite-button more-button" to={`/animal/${animal.id}`}>
          <ExternalLink size={15} /> подробнее о виде
        </Link>
      </div>
    </div>
    <div className="hero-visual">
      <div className="image-frame">
        <img src={animal.image} alt={animal.alt} />
        <span className="photo-tag">снимок дня</span>
      </div>
      <div className="animal-label">
        <span>{animal.species}</span>
        <strong>{animal.name}</strong>
      </div>
    </div>
  </section>
)

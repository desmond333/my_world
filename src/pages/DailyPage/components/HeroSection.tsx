import { Link } from 'react-router-dom'
import { ExternalLink, Sparkles, Star } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { HeroSectionProps } from '../types'

export const HeroSection = ({ animal, isFavorite, onToggleFavorite }: HeroSectionProps) => {
  const { lang, t } = useTranslation()

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">
          <Sparkles size={15} /> {t('animal.kicker')}
        </p>
        <h1>
          {t('animal.got')}
          <br />
          <em>{animal.name}</em>
        </h1>
        <p className="intro">{t('animal.intro')}</p>
        <blockquote>«{animal.phrase}»</blockquote>
        <div className="hero-actions">
          <div className="signature">
            <span className="signature-line" /> {t('animal.warmly')} {animal.name}
          </div>
          <button className={`favorite-button${isFavorite ? ' is-active' : ''}`} onClick={onToggleFavorite} aria-pressed={isFavorite}>
            <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? t('animal.inFavorites') : t('animal.addFavorite')}
          </button>
          <Link className="favorite-button more-button" to={`/animal/${animal.id}`}>
            <ExternalLink size={15} /> {t('animal.aboutSpecies')}
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="image-frame">
          <img src={animal.image} alt={animal.alt} />
          <span className="photo-tag">{t('animal.photoTag')}</span>
        </div>
        <div className="animal-label">
          <span>{animal.species}</span>
          <strong>{animal.name}</strong>
        </div>
      </div>
    </section>
  )
}

import { memo } from 'react'
import { Check, Eye, ImageOff, Info, Plus, Tv } from 'lucide-react'
import type { CollectionListKey, SearchCandidate } from '../../data'
import { yearLabel } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { ToggleGroup, ToggleGroupItem } from '../../shared/ui'
import type { ResultCardProps } from './types'

const listIcon = (key: CollectionListKey, active: boolean) => {
  if (active) return <Check size={14} />
  return key === 'watched' ? <Eye size={14} /> : <Plus size={14} />
}

const metaParts = (candidate: SearchCandidate) =>
  [yearLabel(candidate.year), candidate.score ? `★ ${candidate.score}` : ''].filter(Boolean).join(' · ')

const hasOriginalTitle = (candidate: SearchCandidate) => candidate.subtitle.length > 0 && candidate.subtitle !== candidate.title

export const ResultCard = memo(({ candidate, location, lists, actions, onOpenDetails, detailsLabel, online }: ResultCardProps) => {
  const { t } = useTranslation()
  const label = detailsLabel ?? t('collection.details.label')

  const select = (list: CollectionListKey) => {
    if (location === list) actions.remove(list, candidate.id)
    else if (location === null) actions.add(list, candidate)
    else actions.move(candidate.id, list)
  }

  const original = hasOriginalTitle(candidate)

  return (
    <article className="result-card">
      {onOpenDetails ? (
        <button
          type="button"
          className="result-poster"
          onClick={() => onOpenDetails(candidate)}
          aria-label={`${label}: ${candidate.title}`}
        >
          {candidate.imageUrl ? (
            <img src={candidate.imageUrl} alt="" loading="lazy" />
          ) : (
            <span className="poster-missing">
              <ImageOff size={24} />
            </span>
          )}
          <span className="poster-overlay" aria-hidden="true">
            <span className="poster-overlay-meta">{metaParts(candidate)}</span>
            <span className="poster-overlay-cta">
              <Info size={14} /> {label}
            </span>
          </span>
        </button>
      ) : (
        <div className="result-poster">
          {candidate.imageUrl ? (
            <img src={candidate.imageUrl} alt="" loading="lazy" />
          ) : (
            <span className="poster-missing">
              <ImageOff size={24} />
            </span>
          )}
        </div>
      )}

      <div className="result-body">
        <h3 className="result-title">{candidate.title}</h3>
        {original && <p className="result-original">{candidate.subtitle}</p>}
        <p className="result-meta">{metaParts(candidate)}</p>
        {candidate.description && <p className="result-overview">{candidate.description}</p>}
        {candidate.tags.length > 0 && <p className="result-tags">{candidate.tags.join(', ')}</p>}
      </div>

      <div className="result-actions">
        <ToggleGroup
          type="single"
          value={location ?? ''}
          onValueChange={(value) => {
            if (!value) {
              if (location) actions.remove(location, candidate.id)
              return
            }
            select(value as CollectionListKey)
          }}
          className="result-list-toggle"
        >
          {lists.map((option) => (
            <ToggleGroupItem key={option.key} value={option.key} className="mini-button" title={option.hint}>
              {listIcon(option.key, location === option.key)}
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {onOpenDetails && (
          <button type="button" className="mini-button mini-button--ghost" onClick={() => onOpenDetails(candidate)}>
            <Info size={14} />
            {label}
          </button>
        )}
        {online && (
          <a className="mini-button mini-button--online" href={online.href(candidate.title)} target="_blank" rel="noopener noreferrer">
            <Tv size={14} />
            {online.label}
          </a>
        )}
      </div>
    </article>
  )
})

ResultCard.displayName = 'ResultCard'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Loader2, SearchX, X } from 'lucide-react'
import type { CollectionDetails } from '../../data'
import { useTranslation } from '../../lib/i18n'

export type DetailsModalProps = {
  open: boolean
  title: string
  imageUrl: string | null
  loading: boolean
  error: string
  details: CollectionDetails | null
  onClose: () => void
}

export const DetailsModal = ({ open, title, imageUrl, loading, error, details, onClose }: DetailsModalProps) => {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('collection.details.aria', undefined, { title })}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label={t('common.close')}>
          <X size={18} />
        </button>

        {details?.tagline && <p className="details-tagline">{details.tagline}</p>}
        <h2 className="details-title">{title}</h2>

        {loading && (
          <p className="search-status details-status">
            <Loader2 size={15} className="spin" /> {t('collection.details.loading')}
          </p>
        )}

        {error && !loading && (
          <p className="search-error details-status">
            <SearchX size={15} /> {error}
          </p>
        )}

        {!loading && !error && details && (
          <div className="details-body">
            <div className="details-media">
              {imageUrl ? <img src={imageUrl} alt="" /> : <span className="poster-missing">{t('collection.details.noPoster')}</span>}
            </div>
            <div className="details-content">
              {details.facts.length > 0 && (
                <dl className="details-facts">
                  {details.facts.map((item) => (
                    <div className="details-fact" key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {details.overview && <p className="details-overview">{details.overview}</p>}
              {details.links.length > 0 && (
                <div className="details-links">
                  {details.links.map((link) => (
                    <a className="details-link" key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                      <ExternalLink size={14} /> {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

import * as Dialog from '@radix-ui/react-dialog'
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

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <div className="modal-backdrop">
          <Dialog.Content className="details-modal" aria-describedby={undefined}>
            <Dialog.Close asChild>
              <button type="button" className="modal-close" aria-label={t('common.close')}>
                <X size={18} />
              </button>
            </Dialog.Close>

            {details?.tagline && <p className="details-tagline">{details.tagline}</p>}
            <Dialog.Title asChild>
              <h2 className="details-title">{title}</h2>
            </Dialog.Title>

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
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

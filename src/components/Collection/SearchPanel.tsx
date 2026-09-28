import { useCallback, useEffect, useRef, useState } from 'react'
import { KeyRound, Loader2, Search, SearchX } from 'lucide-react'
import type { CollectionDetails, SearchCandidate } from '../../data'
import { DetailsModal } from './DetailsModal'
import { ResultCard } from './ResultCard'
import type { SearchPanelProps } from './types'

export const SearchPanel = ({ query, results, loading, error, config, lists, locationOf, actions, onQuery }: SearchPanelProps) => {
  const [openId, setOpenId] = useState<string | null>(null)
  const [details, setDetails] = useState<CollectionDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const detailsAbort = useRef<AbortController | null>(null)

  const term = query.trim()
  const asked = term.length >= config.minLength
  const tooShort = term.length > 0 && !asked
  const nothingFound = config.configured && !loading && !error && asked && results.length === 0

  const openCandidate = results.find((item) => item.id === openId) ?? null

  useEffect(() => () => detailsAbort.current?.abort(), [])

  const openDetails = useCallback(
    async (candidate: SearchCandidate) => {
      const loader = config.details?.load
      if (!loader) return
      detailsAbort.current?.abort()
      const controller = new AbortController()
      detailsAbort.current = controller
      setOpenId(candidate.id)
      setDetails(null)
      setDetailsError('')
      setDetailsLoading(true)
      try {
        const loaded = await loader(candidate.id, controller.signal)
        if (controller.signal.aborted) return
        setDetails(loaded)
      } catch (cause) {
        if (controller.signal.aborted) return
        setDetailsError(cause instanceof Error ? cause.message : 'Не удалось загрузить детали.')
      } finally {
        if (!controller.signal.aborted) setDetailsLoading(false)
      }
    },
    [config.details],
  )

  const closeDetails = useCallback(() => {
    detailsAbort.current?.abort()
    detailsAbort.current = null
    setOpenId(null)
    setDetails(null)
    setDetailsError('')
    setDetailsLoading(false)
  }, [])

  return (
    <section className="collection-panel" aria-label={config.panelTitle}>
      <div className="panel-heading">
        <span className="card-kicker">{config.kicker}</span>
        <h2>{config.panelTitle}</h2>
      </div>

      <label className="search-field">
        <span className="search-icon" aria-hidden="true">
          <Search size={16} />
        </span>
        <input
          className="search-input"
          type="search"
          value={query}
          placeholder={config.placeholder}
          aria-label={config.fieldLabel}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>

      {!config.configured && (
        <p className="key-note">
          <KeyRound size={15} />
          <span>{config.notConfiguredHint}</span>
        </p>
      )}

      {config.configured && tooShort && <p className="search-status">Напиши хотя бы {config.minLength} буквы.</p>}

      {config.configured && loading && (
        <p className="search-status">
          <Loader2 size={15} className="spin" /> Ищем «{term}»…
        </p>
      )}

      {config.configured && error && (
        <p className="search-error">
          <SearchX size={15} /> {error}
        </p>
      )}

      {nothingFound && <p className="search-status">По запросу «{term}» ничего не нашлось.</p>}

      {results.length > 0 && (
        <div className="result-grid">
          {results.map((candidate) => (
            <ResultCard
              key={candidate.id}
              candidate={candidate}
              location={locationOf(candidate.id)}
              lists={lists}
              actions={actions}
              onOpenDetails={config.details ? openDetails : undefined}
              detailsLabel={config.details?.label}
              online={config.online}
            />
          ))}
        </div>
      )}

      {config.details && (
        <DetailsModal
          open={openId !== null}
          title={openCandidate?.title ?? ''}
          imageUrl={openCandidate?.imageUrl ?? null}
          loading={detailsLoading}
          error={detailsError}
          details={details}
          onClose={closeDetails}
        />
      )}
    </section>
  )
}

import { memo, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeftRight, CalendarDays, Check, Flame, GripVertical, Heart, ImageOff, MessageSquare, Star, Trash2, Tv, X } from 'lucide-react'
import { otherCollectionList, yearLabel } from '../../lib'
import { countText, useTranslation } from '../../lib/i18n'
import { Slider, Tooltip } from '../../shared/ui'
import type { SortableItemRowProps } from './types'

const todayIso = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

const ENJOYMENT_EMOJI: Record<number, string> = {
  10: '🔥',
  9: '🤩',
  8: '😍',
  7: '😊',
  6: '🙂',
  5: '😐',
  4: '😕',
  3: '🥱',
  2: '😫',
  1: '💩',
}

const formatFinished = (iso: string, locale: string) => {
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export const SortableItemRow = memo(({ item, list, lists, onRemove, onMove, onUpdateItem, online }: SortableItemRowProps) => {
  const { t, lang, locale } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const target = otherCollectionList(list)
  const targetLabel = lists.find((option) => option.key === target)?.label ?? target

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [feelings, setFeelings] = useState(item.review ?? '')
  const [rating, setRating] = useState<number>(item.enjoyment ?? 9)
  const [finishedAt, setFinishedAt] = useState(item.finishedAt ?? todayIso())

  const handleSaveReview = () => {
    onUpdateItem?.(list, item.id, {
      review: feelings.trim() || undefined,
      enjoyment: rating,
      finishedAt: finishedAt || undefined,
    })
    setIsReviewOpen(false)
  }

  const handleClearReview = () => {
    onUpdateItem?.(list, item.id, {
      review: undefined,
      enjoyment: undefined,
    })
    setFeelings('')
    setIsReviewOpen(false)
  }

  const currentDesc = {
    emoji: ENJOYMENT_EMOJI[rating] ?? '⭐',
    label: t(`collection.heat.${rating}`),
  }

  return (
    <li
      ref={setNodeRef}
      className={`collection-row${isDragging ? ' is-dragging' : ''}${isReviewOpen ? ' is-expanded' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="collection-row-main">
        <Tooltip content={t('collection.row.dragAria', undefined, { title: item.title })}>
          <button
            type="button"
            className="drag-handle"
            {...attributes}
            {...listeners}
            aria-label={t('collection.row.dragAria', undefined, { title: item.title })}
          >
            <GripVertical size={17} />
          </button>
        </Tooltip>
        <span className="row-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <ImageOff size={17} />}</span>
        <div className="row-body">
          <h3 className="row-title">{item.title}</h3>
          <p className="row-meta">
            {yearLabel(item.year)}
            {item.tags.length ? ` · ${item.tags.join(', ')}` : ''}
          </p>

          {list === 'watched' && (item.finishedAt || item.enjoyment || item.review) && (
            <div className="row-review-badge">
              {item.finishedAt && (
                <span className="finished-pill">
                  <CalendarDays size={11} /> {formatFinished(item.finishedAt, locale)}
                </span>
              )}
              {item.enjoyment && (
                <span className="enjoyment-pill">
                  {ENJOYMENT_EMOJI[item.enjoyment] ?? '⭐'} {item.enjoyment}/10 {countText('collection.row.heat', item.enjoyment, lang)}
                </span>
              )}
              {item.review && <span className="review-quote">«{item.review}»</span>}
            </div>
          )}
        </div>
        {item.score && (
          <span className="row-score" title={t('collection.row.tmdbScore')}>
            <Star size={13} fill="currentColor" /> {item.score}
          </span>
        )}
        <div className="row-actions">
          {list === 'watched' && (
            <Tooltip content={item.enjoyment ? t('collection.row.feelingsEdit') : t('collection.row.feelingsAdd')}>
              <button
                type="button"
                className={`icon-button${item.enjoyment ? ' is-active' : ''}`}
                onClick={() => setIsReviewOpen((v) => !v)}
                aria-label={t('collection.row.feelings')}
              >
                <Heart size={15} fill={item.enjoyment ? 'currentColor' : 'none'} />
              </button>
            </Tooltip>
          )}
          {online && (
            <Tooltip content={online.label}>
              <a className="icon-button" href={online.href(item.title)} target="_blank" rel="noopener noreferrer" aria-label={online.label}>
                <Tv size={15} />
              </a>
            </Tooltip>
          )}
          <Tooltip content={t('collection.row.moveAria', undefined, { list: targetLabel })}>
            <button
              type="button"
              className="icon-button"
              onClick={() => onMove(item.id, target)}
              aria-label={t('collection.row.moveAria', undefined, { list: targetLabel })}
            >
              <ArrowLeftRight size={15} />
            </button>
          </Tooltip>
          <Tooltip content={t('collection.row.remove')}>
            <button type="button" className="icon-button" onClick={() => onRemove(list, item.id)} aria-label={t('collection.row.remove')}>
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      </div>

      {isReviewOpen && list === 'watched' && (
        <div className="row-review-panel">
          <div className="review-panel-head">
            <div className="review-panel-title">
              <Flame size={16} color="var(--accent)" />
              <h4>{t('collection.row.reviewTitle')}</h4>
            </div>
            <button type="button" className="review-close-btn" onClick={() => setIsReviewOpen(false)} aria-label={t('common.close')}>
              <X size={15} />
            </button>
          </div>

          <div className="review-meter-row">
            <label htmlFor={`enjoyment-slider-${item.id}`} className="review-meter-label">
              <span>{t('collection.row.reviewLiked')}</span>
              <strong className="meter-value-badge">
                {currentDesc.emoji} {rating} / 10 — {currentDesc.label}
              </strong>
            </label>
            <Slider
              className="review-slider"
              value={[rating]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => setRating(values[0] ?? 1)}
              ariaLabel={t('collection.row.reviewLiked')}
              id={`enjoyment-slider-${item.id}`}
            />
          </div>

          <div className="review-date-row">
            <label htmlFor={`finished-at-${item.id}`} className="review-date-label">
              <CalendarDays size={14} /> {t('collection.row.finishedLabel')}
            </label>
            <div className="review-date-controls">
              <input
                id={`finished-at-${item.id}`}
                type="date"
                className="review-date-input"
                value={finishedAt}
                max={todayIso()}
                onChange={(e) => setFinishedAt(e.target.value)}
              />
              {item.finishedAt && (
                <button
                  type="button"
                  className="review-date-clear"
                  onClick={() => {
                    setFinishedAt('')
                    onUpdateItem?.(list, item.id, { finishedAt: undefined })
                  }}
                  title={t('collection.row.finishedClear')}
                >
                  {t('collection.row.finishedClear')}
                </button>
              )}
            </div>
            <small className="review-date-hint">{t('collection.row.finishedHint')}</small>
          </div>

          <div className="review-text-row">
            <label htmlFor={`feelings-input-${item.id}`} className="review-text-label">
              <MessageSquare size={14} /> {t('collection.row.feelingsLabel')}
            </label>
            <textarea
              id={`feelings-input-${item.id}`}
              className="review-textarea"
              placeholder={t('collection.row.feelingsPlaceholder')}
              value={feelings}
              onChange={(e) => setFeelings(e.target.value)}
              rows={3}
            />
          </div>

          <div className="review-panel-actions">
            <button type="button" className="add-button review-save-btn" onClick={handleSaveReview}>
              <Check size={15} /> {t('collection.row.reviewSave')}
            </button>
            {(item.enjoyment || item.review) && (
              <button type="button" className="review-clear-btn" onClick={handleClearReview}>
                {t('collection.row.reviewClear')}
              </button>
            )}
            <button type="button" className="review-cancel-btn" onClick={() => setIsReviewOpen(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </li>
  )
})

SortableItemRow.displayName = 'SortableItemRow'

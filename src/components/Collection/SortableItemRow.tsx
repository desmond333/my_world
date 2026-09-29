import { memo, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeftRight, Check, Flame, GripVertical, Heart, ImageOff, MessageSquare, Star, Trash2, Tv, X } from 'lucide-react'
import { otherCollectionList, yearLabel } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import type { SortableItemRowProps } from './types'

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

const ENJOYMENT_FALLBACK: Record<number, string> = {
  10: 'Чистый кайф! Шедевр',
  9: 'Восторг, на одном дыхании',
  8: 'Очень понравилось, рекомендую',
  7: 'Хорошо, добротно',
  6: 'Нормально, вечер скоротать',
  5: 'Средне, без эмоций',
  4: 'На любителя, затянуто',
  3: 'Скучно, не зацепило',
  2: 'Не понравилось совсем',
  1: 'Зря потратил время',
}

export const SortableItemRow = memo(({ item, list, lists, onRemove, onMove, onUpdateItem, online }: SortableItemRowProps) => {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const target = otherCollectionList(list)
  const targetLabel = lists.find((option) => option.key === target)?.label ?? target

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [feelings, setFeelings] = useState(item.review ?? '')
  const [rating, setRating] = useState<number>(item.enjoyment ?? 9)

  const handleSaveReview = () => {
    onUpdateItem?.(list, item.id, {
      review: feelings.trim() || undefined,
      enjoyment: rating,
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
    label: t(`collection.heat.${rating}`, ENJOYMENT_FALLBACK[rating] ?? ''),
  }

  return (
    <li
      ref={setNodeRef}
      className={`collection-row${isDragging ? ' is-dragging' : ''}${isReviewOpen ? ' is-expanded' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="collection-row-main">
        <button
          type="button"
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label={t('collection.row.dragAria', undefined, { title: item.title })}
        >
          <GripVertical size={17} />
        </button>
        <span className="row-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <ImageOff size={17} />}</span>
        <div className="row-body">
          <h3 className="row-title">{item.title}</h3>
          <p className="row-meta">
            {yearLabel(item.year)}
            {item.tags.length ? ` · ${item.tags.join(', ')}` : ''}
          </p>

          {list === 'watched' && (item.enjoyment || item.review) && (
            <div className="row-review-badge">
              {item.enjoyment && (
                <span className="enjoyment-pill">
                  {ENJOYMENT_EMOJI[item.enjoyment] ?? '⭐'} {item.enjoyment}/10{' '}
                  {t('collection.row.heat', undefined, { count: item.enjoyment })}
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
            <button
              type="button"
              className={`icon-button${item.enjoyment ? ' is-active' : ''}`}
              onClick={() => setIsReviewOpen((v) => !v)}
              title={item.enjoyment ? t('collection.row.feelingsEdit') : t('collection.row.feelingsAdd')}
            >
              <Heart size={15} fill={item.enjoyment ? 'currentColor' : 'none'} />
              <span className="visually-hidden">{t('collection.row.feelings')}</span>
            </button>
          )}
          {online && (
            <a className="icon-button" href={online.href(item.title)} target="_blank" rel="noopener noreferrer" title={online.label}>
              <Tv size={15} />
              <span className="visually-hidden">{online.label}</span>
            </a>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={() => onMove(item.id, target)}
            title={t('collection.row.moveAria', undefined, { list: targetLabel })}
          >
            <ArrowLeftRight size={15} />
            <span className="visually-hidden">{t('collection.row.moveAria', undefined, { list: targetLabel })}</span>
          </button>
          <button type="button" className="icon-button" onClick={() => onRemove(list, item.id)} title={t('collection.row.remove')}>
            <Trash2 size={15} />
            <span className="visually-hidden">{t('collection.row.remove')}</span>
          </button>
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
            <div className="review-rating-selector">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`score-btn${rating === score ? ' is-selected' : ''}`}
                  onClick={() => setRating(score)}
                  title={t(`collection.heat.${score}`, ENJOYMENT_FALLBACK[score])}
                >
                  {score}
                </button>
              ))}
            </div>
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

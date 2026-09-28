import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeftRight, GripVertical, ImageOff, Star, Trash2, Tv } from 'lucide-react'
import { otherCollectionList, yearLabel } from '../../lib'
import type { SortableItemRowProps } from './types'

export const SortableItemRow = memo(({ item, list, lists, onRemove, onMove, online }: SortableItemRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const target = otherCollectionList(list)
  const targetLabel = lists.find((option) => option.key === target)?.label ?? ''

  return (
    <li
      ref={setNodeRef}
      className={`collection-row${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button type="button" className="drag-handle" {...attributes} {...listeners} aria-label={`Перетащить: ${item.title}`}>
        <GripVertical size={17} />
      </button>
      <span className="row-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <ImageOff size={17} />}</span>
      <div className="row-body">
        <h3 className="row-title">{item.title}</h3>
        <p className="row-meta">
          {yearLabel(item.year)}
          {item.tags.length ? ` · ${item.tags.join(', ')}` : ''}
        </p>
      </div>
      {item.score && (
        <span className="row-score">
          <Star size={13} fill="currentColor" /> {item.score}
        </span>
      )}
      <div className="row-actions">
        {online && (
          <a className="icon-button" href={online.href(item.title)} target="_blank" rel="noopener noreferrer" title={online.label}>
            <Tv size={15} />
            <span className="visually-hidden">{online.label}</span>
          </a>
        )}
        <button type="button" className="icon-button" onClick={() => onMove(item.id, target)} title={`Перенести в «${targetLabel}»`}>
          <ArrowLeftRight size={15} />
          <span className="visually-hidden">Перенести в «{targetLabel}»</span>
        </button>
        <button type="button" className="icon-button" onClick={() => onRemove(list, item.id)} title="Убрать из списка">
          <Trash2 size={15} />
          <span className="visually-hidden">Убрать из списка</span>
        </button>
      </div>
    </li>
  )
})

SortableItemRow.displayName = 'SortableItemRow'

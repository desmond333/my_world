import { memo, useMemo } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GripVertical, Inbox } from 'lucide-react'
import type { CollectionListKey } from '../../data'
import { useTranslation } from '../../lib/i18n'
import { CollectionFilters } from './CollectionFilters'
import { SortableItemRow } from './SortableItemRow'
import type { CollectionBoardProps } from './types'

const DRAG_ACTIVATION_DISTANCE = 6

export const CollectionBoard = memo(
  ({
    list,
    items,
    counts,
    lists,
    tags,
    tag,
    periods,
    periodId,
    online,
    onList,
    onTag,
    onPeriod,
    onRemove,
    onMove,
    onReorder,
    onUpdateItem,
  }: CollectionBoardProps) => {
    const { t } = useTranslation()
    const listLabel = (key: CollectionListKey) => lists.find((option) => option.key === key)?.label ?? key
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const ids = useMemo(() => items.map((item) => item.id), [items])

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const from = ids.indexOf(String(active.id))
      const to = ids.indexOf(String(over.id))
      if (from < 0 || to < 0) return
      onReorder(arrayMove(ids, from, to))
    }

    return (
      <section className="collection-panel" aria-label={t('collection.listsAria')}>
        <div className="panel-heading">
          <span className="card-kicker">{t('collection.listsKicker')}</span>
          <h2>{listLabel(list)}</h2>
        </div>

        <div className="list-switch" role="group" aria-label={t('collection.listSwitchAria')}>
          {lists.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={list === option.key}
              className={`list-tab${list === option.key ? ' is-on' : ''}`}
              onClick={() => onList(option.key)}
              title={option.hint}
            >
              {listLabel(option.key)}
              {counts[option.key] > 0 && <span className="list-count">{counts[option.key]}</span>}
            </button>
          ))}
        </div>

        {counts[list] === 0 ? (
          <p className="list-empty">
            <Inbox size={19} /> {t('collection.empty')}
          </p>
        ) : (
          <>
            <CollectionFilters tags={tags} tag={tag} periods={periods} periodId={periodId} onTag={onTag} onPeriod={onPeriod} />

            <p className="list-summary">{t('collection.summary', undefined, { shown: items.length, total: counts[list] })}</p>

            {items.length === 0 ? (
              <p className="list-empty">{t('collection.emptyFilters')}</p>
            ) : (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <ul className="collection-list">
                      {items.map((item) => (
                        <SortableItemRow
                          key={item.id}
                          item={item}
                          list={list}
                          lists={lists}
                          online={online}
                          onRemove={onRemove}
                          onMove={onMove}
                          onUpdateItem={onUpdateItem}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
                {items.length > 1 && (
                  <p className="dnd-hint">
                    <GripVertical size={14} /> {t('collection.dndHint')}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </section>
    )
  },
)

CollectionBoard.displayName = 'CollectionBoard'

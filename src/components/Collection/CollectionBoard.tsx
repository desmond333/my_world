import { memo, useMemo } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GripVertical, Inbox } from 'lucide-react'
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
  }: CollectionBoardProps) => {
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
      <section className="collection-panel" aria-label="Списки">
        <div className="panel-heading">
          <span className="card-kicker">твои списки</span>
          <h2>{lists.find((option) => option.key === list)?.label}</h2>
        </div>

        <div className="list-switch" role="group" aria-label="Выбор списка">
          {lists.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={list === option.key}
              className={`list-tab${list === option.key ? ' is-on' : ''}`}
              onClick={() => onList(option.key)}
              title={option.hint}
            >
              {option.label}
              {counts[option.key] > 0 && <span className="list-count">{counts[option.key]}</span>}
            </button>
          ))}
        </div>

        {counts[list] === 0 ? (
          <p className="list-empty">
            <Inbox size={19} /> Пока пусто. Найди выше и добавь в этот список.
          </p>
        ) : (
          <>
            <CollectionFilters tags={tags} tag={tag} periods={periods} periodId={periodId} onTag={onTag} onPeriod={onPeriod} />

            <p className="list-summary">
              Показано {items.length} из {counts[list]}
            </p>

            {items.length === 0 ? (
              <p className="list-empty">Под эти фильтры ничего не подходит.</p>
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
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
                {items.length > 1 && (
                  <p className="dnd-hint">
                    <GripVertical size={14} /> Потяни за ручку — порядок сохранится. С клавиатуры: пробел, стрелки, пробел.
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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Columns3,
  Eraser,
  FileText,
  Flame,
  List,
  Pencil,
  Plus,
  Repeat,
  Search,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  User,
  Users,
  X,
} from 'lucide-react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ProductivityItem, ProductivityKind, RepeatInterval, TaskPriority } from '../../../data'
import { findCity } from '../../../data'
import {
  POINTS,
  REPEAT_OPTIONS,
  dayLabel,
  dayTagKind,
  getRepeatLabel,
  groupByDay,
  kanbanGroups,
  orderItems,
  parseQuickAdd,
  shiftDate,
  undatedLabel,
} from '../../../lib'
import type { Lang } from '../../../lib/i18n'
import { useTranslation } from '../../../lib/i18n'
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ProgressRing,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '../../../shared/ui'
import { getDateForTimezone, useDailyStore, useFriendsStore, usePageViewMode, useProductivityStore } from '../../../store'
import type { ProductivitySnapshot } from '../../../store'

export type ProductivityListProps = {
  kind: ProductivityKind
  empty: string
  fieldLabel: string
  placeholder: string
}

export type ProductivityFilter = 'all' | 'today' | 'overdue' | 'repeating' | 'from_friends' | 'sent'
export type ProductivityView = 'list' | 'kanban'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'var(--coral)',
  medium: 'var(--accent)',
  low: 'var(--muted)',
}

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low']
const REPEATS: RepeatInterval[] = ['none', 'daily', 'weekdays', 'weekly', 'monthly']

const matchesQuery = (item: ProductivityItem, query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return item.title.toLowerCase().includes(needle) || (item.note ?? '').toLowerCase().includes(needle)
}

const isRepeating = (item: ProductivityItem) => Boolean(item.repeat && item.repeat !== 'none')

type SortableItemProps = { item: ProductivityItem; children: React.ReactNode }

const SortableItem = ({ item, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  )
}

type DateCellProps = {
  item: ProductivityItem
  today: string
  lang: Lang
  onChange: (date: string) => void
}

const DateCell = ({ item, today, lang, onChange }: DateCellProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const isUndated = !item.date
  const label = item.date ? dayLabel(item.date, today, lang) : undatedLabel(lang)
  const tag = dayTagKind(item.date, today)

  return (
    <div className="point-date-cell">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`point-date-chip tag-${tag}${isUndated ? ' is-undated' : ''}${open ? ' is-open' : ''}`}
            aria-label={item.date ? t('productivity.date.openAria', undefined, { label }) : t('productivity.date.undatedAria')}
          >
            <CalendarDays size={12} />
            <span>{label}</span>
            <ChevronRight size={12} className="point-date-chip-arrow" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="point-date-pop"
          align="start"
          sideOffset={4}
          aria-label={t('productivity.date.pickAria', undefined, { title: item.title })}
        >
          <input
            type="date"
            className="point-date-input"
            value={item.date}
            onChange={(event) => {
              onChange(event.target.value)
              setOpen(false)
            }}
          />
          <div className="point-date-pop-row">
            <button
              type="button"
              onClick={() => {
                onChange(today)
                setOpen(false)
              }}
              className="mini-button"
            >
              {t('common.today')}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(shiftDate(today, 1))
                setOpen(false)
              }}
              className="mini-button"
            >
              {t('common.tomorrow')}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(shiftDate(item.date || today, 7))
                setOpen(false)
              }}
              className="mini-button"
            >
              {t('productivity.date.plusWeek')}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="mini-button"
              title={t('productivity.date.clear')}
              aria-label={t('productivity.date.clear')}
            >
              <Eraser size={12} />
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const ProductivityList = ({ kind, empty, fieldLabel, placeholder }: ProductivityListProps) => {
  const { lang, t } = useTranslation()
  const all = useProductivityStore((state) => state.items)
  const add = useProductivityStore((state) => state.add)
  const toggle = useProductivityStore((state) => state.toggle)
  const move = useProductivityStore((state) => state.move)
  const reorder = useProductivityStore((state) => state.reorder)
  const setItemRepeat = useProductivityStore((state) => state.setRepeat)
  const setPriority = useProductivityStore((state) => state.setPriority)
  const setNote = useProductivityStore((state) => state.setNote)
  const setItemTitle = useProductivityStore((state) => state.setTitle)
  const remove = useProductivityStore((state) => state.remove)
  const clearDone = useProductivityStore((state) => state.clearDone)
  const snapshot = useProductivityStore((state) => state.snapshot)
  const restore = useProductivityStore((state) => state.restore)
  const cityId = useDailyStore((state) => state.cityId)
  const today = useMemo(() => getDateForTimezone(findCity(cityId).timezone), [cityId])

  const { isNormal, mode } = usePageViewMode('productivity')

  const friends = useFriendsStore((state) => state.friends)
  const assignTaskToFriend = useFriendsStore((state) => state.assignTask)
  const sentTasks = useFriendsStore((state) => state.sentTasks)
  const fetchSentTasks = useFriendsStore((state) => state.fetchSentTasks)

  const [draft, setDraft] = useState('')
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const [pickedPriority, setPickedPriority] = useState<TaskPriority | null>(null)
  const [pickedRepeat, setPickedRepeat] = useState<RepeatInterval | null>(null)
  const [targetFriendId, setTargetFriendId] = useState<string>('')
  const [friendFeedback, setFriendFeedback] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProductivityFilter>('all')
  const [view, setView] = useState<ProductivityView>(kind === 'task' ? 'kanban' : 'list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [flashId, setFlashId] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [undoState, setUndoState] = useState<{ snap: ProductivitySnapshot; label: string } | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const draftRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const items = useMemo(() => all.filter((item) => item.kind === kind), [all, kind])
  const parsed = useMemo(() => parseQuickAdd(draft, today, lang), [draft, today, lang])
  const canSubmit = parsed.title.trim().length > 0
  const hasPickedDate = pickedDate !== null
  const hasPickedPriority = pickedPriority !== null
  const hasPickedRepeat = pickedRepeat !== null
  const effectiveDate = hasPickedDate ? pickedDate : parsed.date
  const effectivePriority = hasPickedPriority ? pickedPriority : parsed.priority
  const effectiveRepeat = hasPickedRepeat ? pickedRepeat : parsed.repeat
  const hasOverrides = hasPickedDate || hasPickedPriority || hasPickedRepeat
  const picks = [
    ...(effectiveDate
      ? [
          {
            group: 'date' as const,
            icon: <CalendarDays size={12} />,
            label: dayLabel(effectiveDate, today, lang),
            color: undefined as string | undefined,
          },
        ]
      : []),
    ...(effectivePriority !== 'medium'
      ? [
          {
            group: 'priority' as const,
            icon: <Flame size={12} />,
            label: t(`productivity.priority.${effectivePriority}`),
            color: PRIORITY_COLORS[effectivePriority],
          },
        ]
      : []),
    ...(kind === 'task' && effectiveRepeat !== 'none'
      ? [
          {
            group: 'repeat' as const,
            icon: <Repeat size={12} />,
            label: t(`productivity.repeat.${effectiveRepeat}`),
            color: undefined as string | undefined,
          },
        ]
      : []),
  ]

  const pushUndo = useCallback(
    (label: string) => {
      setUndoState({ snap: snapshot(), label })
      if (undoTimer.current) clearTimeout(undoTimer.current)
      undoTimer.current = setTimeout(() => setUndoState(null), 9000)
    },
    [snapshot],
  )

  const runUndo = useCallback(() => {
    setUndoState((state) => {
      if (state) restore(state.snap)
      return null
    })
  }, [restore])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (typing) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        runUndo()
        return
      }
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        draftRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [runUndo])

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
      if (undoTimer.current) clearTimeout(undoTimer.current)
    },
    [],
  )

  const filtered = useMemo(() => items.filter((item) => matchesQuery(item, query)), [items, query])

  const visible = useMemo(() => {
    if (filter === 'today') return filtered.filter((item) => item.date === today)
    if (filter === 'overdue') return filtered.filter((item) => !item.done && item.date && item.date < today)
    if (filter === 'repeating') return filtered.filter(isRepeating)
    if (filter === 'from_friends') return filtered.filter((item) => Boolean(item.senderName))
    return filtered
  }, [filtered, filter, today])

  const open = useMemo(() => orderItems(visible.filter((item) => !item.done)), [visible])
  const closed = useMemo(() => orderItems(visible.filter((item) => item.done)), [visible])
  const openGroups = useMemo(() => groupByDay(open, today, lang), [open, today, lang])
  const closedGroups = useMemo(() => groupByDay(closed, today, lang), [closed, today, lang])
  const columns = useMemo(() => kanbanGroups(filtered, today, lang), [filtered, today, lang])

  const overdueCount = useMemo(() => items.filter((item) => !item.done && item.date && item.date < today).length, [items, today])
  const totalOpenCount = useMemo(() => items.filter((item) => !item.done).length, [items])
  const plannedTodayCount = useMemo(() => items.filter((item) => item.date === today && !item.done).length, [items, today])
  const repeatingCount = useMemo(() => items.filter(isRepeating).length, [items])
  const totalClosedCount = useMemo(() => items.filter((item) => item.done).length, [items])
  const fromFriendsCount = useMemo(() => items.filter((item) => !item.done && Boolean(item.senderName)).length, [items])

  const pickDate = (value: string) => setPickedDate((prev) => (prev === value ? null : value))
  const pickPriority = (value: TaskPriority) => setPickedPriority((prev) => (prev === value ? null : value))
  const pickRepeat = (value: RepeatInterval) => setPickedRepeat((prev) => (prev === value ? null : value))
  const clearPick = (group: 'date' | 'priority' | 'repeat') => {
    if (group === 'date') setPickedDate(null)
    if (group === 'priority') setPickedPriority(null)
    if (group === 'repeat') setPickedRepeat(null)
  }

  const submit = () => {
    if (!canSubmit) return

    if (targetFriendId && kind === 'task') {
      const target = friends.find((f) => f.id === targetFriendId)
      const friendEmail = target?.email || ''
      void assignTaskToFriend({
        friendId: targetFriendId,
        title: parsed.title,
        date: effectiveDate,
        priority: effectivePriority,
      }).then((res) => {
        if (res.success) {
          setFriendFeedback(t('friends.task.sentSuccess', undefined, { friend: friendEmail }))
          setTimeout(() => setFriendFeedback(null), 3500)
        } else {
          setFriendFeedback(res.message || 'Error')
          setTimeout(() => setFriendFeedback(null), 3500)
        }
      })
      setDraft('')
      setPickedDate(null)
      setPickedPriority(null)
      setPickedRepeat(null)
      setTargetFriendId('')
      return
    }

    add(kind, parsed.title, effectiveDate, kind === 'task' ? effectiveRepeat : 'none', effectivePriority)
    setDraft('')
    setPickedDate(null)
    setPickedPriority(null)
    setPickedRepeat(null)
  }

  const handleToggle = useCallback(
    (id: string) => {
      toggle(id, today)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      setFlashId(id)
      flashTimer.current = setTimeout(() => setFlashId(null), 900)
    },
    [toggle, today],
  )

  const handleRemove = (item: ProductivityItem) => {
    pushUndo(t('productivity.undo.removed'))
    remove(item.id)
  }

  const handleClearDone = () => {
    pushUndo(t('productivity.undo.cleared'))
    clearDone(kind)
  }

  const startEdit = (item: ProductivityItem) => {
    setEditingId(item.id)
    setEditingValue(item.title)
  }

  const commitEdit = (id: string) => {
    if (editingValue.trim()) setItemTitle(id, editingValue)
    setEditingId(null)
    setEditingValue('')
  }

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorder(String(active.id), String(over.id))
  }

  const renderItem = (item: ProductivityItem, isClosed = false) => {
    const itemRepeat = item.repeat && item.repeat !== 'none' ? item.repeat : 'none'
    const recurring = itemRepeat !== 'none'
    const isFlashing = flashId === item.id
    const noteOpen = expandedNotes.has(item.id)
    const isEditing = editingId === item.id
    const itemPriority = item.priority ?? 'medium'
    const overdue = !item.done && Boolean(item.date) && item.date < today

    return (
      <div className={`point-item${item.done ? ' is-done' : ''}${recurring ? ' is-recurring' : ''}${isFlashing ? ' is-flash' : ''}`}>
        <span className="point-priority-bar" style={{ background: item.done ? 'var(--line)' : PRIORITY_COLORS[itemPriority] }} />

        <Checkbox
          className="point-check"
          checked={item.done}
          onCheckedChange={() => handleToggle(item.id)}
          aria-label={item.done ? t('productivity.item.restore') : t('productivity.item.complete')}
        />

        <div className="point-main">
          {isEditing ? (
            <input
              className="point-title-edit"
              autoFocus
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => commitEdit(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit(item.id)
                if (e.key === 'Escape') setEditingId(null)
              }}
            />
          ) : (
            <span
              className="point-title"
              onDoubleClick={() => !item.done && startEdit(item)}
              title={t('productivity.item.editAria', undefined, { title: item.title })}
            >
              {item.title}
              {item.senderName && (
                <span
                  className="point-sender-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginLeft: '6px',
                  }}
                  title={item.senderName}
                >
                  <User size={10} />
                  {t('friends.task.senderBadge', undefined, { name: item.senderName })}
                </span>
              )}
            </span>
          )}

          {!isClosed && !isEditing && (
            <div className="point-inline-actions">
              {!item.done && (
                <button type="button" className="point-icon-action" onClick={() => startEdit(item)} title={t('productivity.item.edit')}>
                  <Pencil size={11} />
                </button>
              )}
              <button
                type="button"
                className={`point-icon-action${noteOpen ? ' is-active' : ''}`}
                onClick={() => toggleNote(item.id)}
                title={noteOpen ? t('productivity.note.hide') : t('productivity.note.add')}
              >
                <FileText size={11} />
              </button>
            </div>
          )}

          {noteOpen && (
            <textarea
              className="point-note"
              value={item.note ?? ''}
              placeholder={t('productivity.note.placeholder')}
              onChange={(e) => setNote(item.id, e.target.value)}
              rows={2}
            />
          )}

          {kind === 'task' && !isClosed && (
            <div className={`point-repeat-control${recurring ? ' is-active' : ''}`}>
              <Repeat size={12} className="point-repeat-icon" />
              <Select value={itemRepeat} onValueChange={(value) => setItemRepeat(item.id, value as RepeatInterval)}>
                <SelectTrigger
                  className="point-repeat-select"
                  title={t('productivity.repeat.title')}
                  aria-label={t('productivity.repeat.ariaItem', undefined, { title: item.title })}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPEAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {t(`productivity.repeat.${opt.id === 'none' ? 'oneTime' : opt.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {kind === 'task' && isClosed && recurring && (
            <span className="point-repeat-badge is-muted" title={t('productivity.repeat.badgeTitle')}>
              <Repeat size={11} />
              <span>{getRepeatLabel(itemRepeat, lang) || itemRepeat}</span>
            </span>
          )}
        </div>

        {!isClosed && (
          <div className="point-priority-btns">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                className={`point-priority-dot${itemPriority === p ? ' is-active' : ''}`}
                style={{ background: itemPriority === p ? PRIORITY_COLORS[p] : undefined }}
                onClick={() => setPriority(item.id, p)}
                title={`${t('productivity.priority.label')}: ${t(`productivity.priority.${p}`)}`}
                aria-label={`${t('productivity.priority.label')}: ${t(`productivity.priority.${p}`)}`}
              />
            ))}
          </div>
        )}

        <DateCell item={item} today={today} lang={lang} onChange={(date) => move(item.id, date)} />

        <Tooltip content={t('productivity.item.remove')}>
          <button
            type="button"
            className="icon-button point-remove-btn"
            onClick={() => handleRemove(item)}
            aria-label={t('productivity.item.removeAria', undefined, { title: item.title })}
          >
            <Trash2 size={15} />
          </button>
        </Tooltip>

        {overdue && <span className="point-overdue-badge">{t('productivity.filter.overdue')}</span>}
      </div>
    )
  }

  const renderGroups = (groups: ReturnType<typeof groupByDay>, isClosed = false) =>
    groups.map((group) => {
      const tag = dayTagKind(group.key, today)
      return (
        <section key={group.key || 'undated'} className={`point-group tag-${tag}`}>
          <p className={`point-group-title tag-${tag}`}>
            <CalendarDays size={13} />
            <span className="point-group-name">{group.label}</span>
            <span className="point-group-badge">{group.items.length}</span>
          </p>
          {isClosed ? (
            <ul className="point-list">
              {group.items.map((item) => (
                <li key={item.id}>{renderItem(item, true)}</li>
              ))}
            </ul>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="point-list">
                  {group.items.map((item) => (
                    <SortableItem key={item.id} item={item}>
                      {renderItem(item)}
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
      )
    })

  const renderKanban = () => (
    <div className="point-kanban">
      {columns.map((col) => (
        <div key={col.key} className={`point-kanban-col point-kanban-col--${col.key}`}>
          <p className="point-kanban-head">
            <span className="point-kanban-label">{col.label}</span>
            <span className="point-kanban-count">{col.items.length}</span>
          </p>
          {col.items.length === 0 ? (
            <p className="point-kanban-empty">{t('productivity.kanban.emptyCol')}</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={col.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="point-list point-list--kanban">
                  {col.items.map((item) => (
                    <SortableItem key={item.id} item={item}>
                      {renderItem(item)}
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      ))}
    </div>
  )

  const dateChips: { label: string; value: string }[] = [
    { label: t('common.today'), value: today },
    { label: t('common.tomorrow'), value: shiftDate(today, 1) },
    { label: t('productivity.date.afterTomorrow'), value: shiftDate(today, 2) },
    { label: t('productivity.date.plusWeek'), value: shiftDate(today, 7) },
  ]

  const emptyMessage = (() => {
    if (query.trim()) return t('productivity.empty.search', undefined, { query: query.trim() })
    if (filter === 'today') return t('productivity.empty.today')
    if (filter === 'overdue') return t('productivity.empty.overdue')
    if (filter === 'repeating') return t('productivity.empty.repeating')
    return t('productivity.empty.all')
  })()

  const isKanban = isNormal && view === 'kanban' && kind === 'task' && filter === 'all' && !query.trim()
  const isEmptyView = items.length === 0 || (isKanban ? columns.every((col) => col.items.length === 0) : openGroups.length === 0)

  return (
    <div className={`point-panel view-mode-${mode}`}>
      <div className="point-head">
        <div className="point-head-title">
          <h2>{t(`productivity.kind.${kind}`)}</h2>
          <span className="point-rate">{t('productivity.pointsEach', undefined, { count: POINTS[kind] })}</span>
        </div>
        <div className="point-stats-bar">
          <div className="point-stat-chip">
            <span className="point-stat-label">{t('productivity.stat.open')}</span>
            <span className="point-stat-val">{totalOpenCount}</span>
          </div>
          {isNormal && (
            <div className="point-stat-chip">
              <span className="point-stat-label">{t('productivity.stat.today')}</span>
              <span className="point-stat-val">{plannedTodayCount}</span>
            </div>
          )}
          {isNormal && kind === 'task' && (
            <div className="point-stat-chip">
              <span className="point-stat-label">{t('productivity.stat.repeat')}</span>
              <span className="point-stat-val">{repeatingCount}</span>
            </div>
          )}
          <div className="point-stat-chip">
            <span className="point-stat-label">{t('productivity.stat.done')}</span>
            <span className="point-stat-val is-accent">{totalClosedCount}</span>
          </div>
          {isNormal && items.length > 0 && (
            <ProgressRing
              value={totalClosedCount}
              max={items.length}
              size={42}
              strokeWidth={4}
              valueText={`${Math.round((totalClosedCount / items.length) * 100)}%`}
            />
          )}
        </div>
      </div>

      <form
        className="point-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="point-form-primary">
          <label className="point-field">
            <span className="visually-hidden">{fieldLabel}</span>
            <input
              ref={draftRef}
              type="text"
              value={draft}
              placeholder={placeholder}
              onChange={(event) => setDraft(event.target.value)}
              autoComplete="off"
            />
          </label>

          <button type="submit" className="add-button point-add" disabled={!canSubmit}>
            <Plus size={16} /> {t('common.add')}
          </button>
        </div>

        {kind === 'task' && friends.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--muted)' }}>
            <Users size={13} />
            <span>{t('friends.task.assignTo')}</span>
            <Select value={targetFriendId || 'self'} onValueChange={(value) => setTargetFriendId(value === 'self' ? '' : value)}>
              <SelectTrigger className={`point-friend-select${targetFriendId ? ' is-on' : ''}`} aria-label={t('friends.task.assignTo')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">{t('friends.task.toMe')}</SelectItem>
                {friends.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {friendFeedback && (
          <div style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 500 }}>{friendFeedback}</div>
        )}

        {isNormal && <p className="point-quick-hint">{t('productivity.quick.hint')}</p>}

        {isNormal && picks.length > 0 && (
          <div className="point-detected" aria-live="polite">
            <span className="point-detected-label">{t('productivity.quick.detected')}</span>
            {picks.map((pick) => (
              <span
                key={pick.group}
                className={`point-detected-chip${hasOverrides ? ' is-editable' : ''}`}
                style={pick.color ? { color: pick.color } : undefined}
              >
                {pick.icon} {pick.label}
                {hasOverrides && (
                  <button
                    type="button"
                    className="point-detected-clear"
                    onClick={() => clearPick(pick.group)}
                    title={t('productivity.quick.clearPick')}
                    aria-label={t('productivity.quick.clearPick')}
                  >
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {isNormal && (
          <div className="point-chip-rows">
            <ToggleGroup
              type="single"
              value={effectiveDate || 'none'}
              onValueChange={(value) => {
                if (!value) setPickedDate(null)
                else if (value === 'none') setPickedDate('')
                else pickDate(value)
              }}
              className="point-chip-row"
              aria-label={t('productivity.quick.appendDate')}
            >
              {dateChips.map((chip) => (
                <ToggleGroupItem key={chip.label} value={chip.value} className="point-quick-chip">
                  {chip.label}
                </ToggleGroupItem>
              ))}
              <ToggleGroupItem value="none" className="point-quick-chip">
                {t('productivity.date.none')}
              </ToggleGroupItem>
            </ToggleGroup>

            {kind === 'task' && (
              <>
                <ToggleGroup
                  type="single"
                  value={effectivePriority}
                  onValueChange={(value) => {
                    if (!value) setPickedPriority(null)
                    else pickPriority(value as TaskPriority)
                  }}
                  className="point-chip-row"
                  aria-label={t('productivity.quick.appendPriority')}
                >
                  {PRIORITIES.map((p) => (
                    <ToggleGroupItem
                      key={p}
                      value={p}
                      className="point-quick-chip"
                      style={effectivePriority === p ? { borderColor: PRIORITY_COLORS[p], color: PRIORITY_COLORS[p] } : undefined}
                    >
                      {t(`productivity.priority.${p}`)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <ToggleGroup
                  type="single"
                  value={effectiveRepeat}
                  onValueChange={(value) => {
                    if (!value) setPickedRepeat(null)
                    else pickRepeat(value as RepeatInterval)
                  }}
                  className="point-chip-row"
                  aria-label={t('productivity.quick.appendRepeat')}
                >
                  {REPEATS.map((r) => (
                    <ToggleGroupItem key={r} value={r} className="point-quick-chip">
                      {r === 'none' ? t('productivity.repeat.oneTime') : t(`productivity.repeat.${r}`)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </>
            )}
          </div>
        )}
      </form>

      <div className="point-toolbar">
        <div className="point-filters">
          <button type="button" className={`mini-button${filter === 'all' ? ' is-on' : ''}`} onClick={() => setFilter('all')}>
            {t('productivity.filter.all')} ({totalOpenCount})
          </button>
          <button type="button" className={`mini-button${filter === 'today' ? ' is-on' : ''}`} onClick={() => setFilter('today')}>
            {t('productivity.filter.today')} ({plannedTodayCount})
          </button>
          {kind === 'task' && (
            <button
              type="button"
              className={`mini-button${filter === 'overdue' ? ' is-on' : ''}`}
              onClick={() => setFilter('overdue')}
              disabled={overdueCount === 0}
            >
              {t('productivity.filter.overdue')} ({overdueCount})
            </button>
          )}
          {kind === 'task' && (
            <button type="button" className={`mini-button${filter === 'repeating' ? ' is-on' : ''}`} onClick={() => setFilter('repeating')}>
              {t('productivity.filter.repeating')} ({repeatingCount})
            </button>
          )}
          {kind === 'task' && (isNormal || fromFriendsCount > 0) && (
            <button
              type="button"
              className={`mini-button${filter === 'from_friends' ? ' is-on' : ''}`}
              onClick={() => setFilter('from_friends')}
            >
              <User size={11} style={{ marginRight: '3px' }} />
              {t('friends.task.filterFromFriends')} ({fromFriendsCount})
            </button>
          )}
          {kind === 'task' && isNormal && (
            <button
              type="button"
              className={`mini-button${filter === 'sent' ? ' is-on' : ''}`}
              onClick={() => {
                setFilter('sent')
                void fetchSentTasks()
              }}
            >
              <Send size={11} style={{ marginRight: '3px' }} />
              {t('friends.task.filterSent')} ({sentTasks.length})
            </button>
          )}
        </div>

        <div className="point-toolbar-right">
          {isNormal && (
            <label className="point-search">
              <Search size={13} aria-hidden="true" />
              <span className="visually-hidden">{t('productivity.search.field')}</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder={t('productivity.search.placeholder')}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('productivity.search.field')}
              />
              {query && (
                <button
                  type="button"
                  className="point-search-clear"
                  onClick={() => setQuery('')}
                  title={t('productivity.search.clear')}
                  aria-label={t('productivity.search.clear')}
                >
                  <X size={12} />
                </button>
              )}
            </label>
          )}

          {isNormal && kind === 'task' && (
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => {
                if (value) setView(value as ProductivityView)
              }}
              className="point-view-toggle"
            >
              <ToggleGroupItem
                value="kanban"
                className="mini-button point-view-btn"
                title={t('productivity.view.kanban')}
                aria-label={t('productivity.view.kanban')}
              >
                <Columns3 size={13} />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                className="mini-button point-view-btn"
                title={t('productivity.view.list')}
                aria-label={t('productivity.view.list')}
              >
                <List size={13} />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </div>

      {filter === 'sent' ? (
        <section className="point-group">
          <p className="point-group-title">
            <Send size={13} />
            <span className="point-group-name">{t('friends.task.sentTitle')}</span>
            <span className="point-group-badge">{sentTasks.length}</span>
          </p>
          {sentTasks.length === 0 ? (
            <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>{t('friends.task.sentEmpty')}</p>
          ) : (
            <ul className="point-list">
              {sentTasks.map((st) => (
                <li
                  key={st.id}
                  className="point-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    margin: '4px 0',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 500,
                        textDecoration: st.done ? 'line-through' : 'none',
                        color: st.done ? 'var(--muted)' : 'var(--fg)',
                      }}
                    >
                      {st.title}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                      {t('friends.task.recipient', undefined, { email: st.recipientEmail })}
                      {st.date && ` • ${st.date}`}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: st.done ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                      color: st.done ? '#16a34a' : '#ca8a04',
                    }}
                  >
                    {st.done ? t('friends.task.statusDone') : t('friends.task.statusPending')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : items.length === 0 ? (
        <div className="point-empty-state">
          <Sparkles size={26} className="point-empty-icon" />
          <p className="point-empty">{empty}</p>
        </div>
      ) : isKanban ? (
        renderKanban()
      ) : isEmptyView ? (
        <div className="point-empty-state">
          <CheckCircle2 size={26} className="point-empty-icon" />
          <p className="point-empty">{emptyMessage}</p>
        </div>
      ) : (
        renderGroups(openGroups, false)
      )}

      {closedGroups.length > 0 && (
        <div className="point-done-section">
          <div className="point-done-head">
            <p className="point-done-title">{t('productivity.doneTitle', undefined, { count: closed.length })}</p>
            <div className="point-done-actions">
              <button type="button" className="mini-button" onClick={() => setShowDone((value) => !value)}>
                {showDone ? t('productivity.done.hide') : t('productivity.done.show')}
              </button>
              <button type="button" className="mini-button" onClick={handleClearDone}>
                <Eraser size={12} /> {t('productivity.done.clear')}
              </button>
            </div>
          </div>
          {showDone && renderGroups(closedGroups, true)}
        </div>
      )}

      <p className="point-shortcuts">
        <AlarmClock size={12} /> {t('productivity.shortcuts.hint')}
      </p>

      {undoState && (
        <div className="point-undo" role="status">
          <span>{undoState.label}</span>
          <button type="button" className="mini-button" onClick={runUndo}>
            <Undo2 size={12} /> {t('productivity.undo.label')}
          </button>
        </div>
      )}
    </div>
  )
}

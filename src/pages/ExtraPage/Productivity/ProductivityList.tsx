import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Plus, Repeat, Sparkles, Trash2 } from 'lucide-react'
import type { ProductivityItem, ProductivityKind, RepeatInterval } from '../../../data'
import { findCity } from '../../../data'
import {
  KIND_TITLES,
  POINTS,
  REPEAT_OPTIONS,
  UNTITLED_DAY,
  dayTagKind,
  getRepeatLabel,
  groupByDay,
  orderItems,
  shiftDate,
} from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { getDateForTimezone, useDailyStore, useProductivityStore } from '../../../store'

export type ProductivityListProps = {
  kind: ProductivityKind
  empty: string
  fieldLabel: string
  placeholder: string
}

export type ProductivityFilter = 'all' | 'today' | 'repeating'

export const ProductivityList = ({ kind, empty, fieldLabel, placeholder }: ProductivityListProps) => {
  const { lang } = useTranslation()
  const all = useProductivityStore((state) => state.items)
  const add = useProductivityStore((state) => state.add)
  const toggle = useProductivityStore((state) => state.toggle)
  const move = useProductivityStore((state) => state.move)
  const setItemRepeat = useProductivityStore((state) => state.setRepeat)
  const remove = useProductivityStore((state) => state.remove)
  const cityId = useDailyStore((state) => state.cityId)
  const today = useMemo(() => getDateForTimezone(findCity(cityId).timezone), [cityId])

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [repeat, setRepeatInterval] = useState<RepeatInterval>('none')
  const [filter, setFilter] = useState<ProductivityFilter>('all')

  const items = useMemo(() => all.filter((item) => item.kind === kind), [all, kind])

  const visible = useMemo(() => {
    if (filter === 'today') {
      return items.filter((item) => item.date === today)
    }
    if (filter === 'repeating') {
      return items.filter((item) => item.repeat && item.repeat !== 'none')
    }
    return items
  }, [items, filter, today])

  const open = useMemo(() => orderItems(visible.filter((item) => !item.done)), [visible])
  const closed = useMemo(() => orderItems(visible.filter((item) => item.done)), [visible])
  const openGroups = useMemo(() => groupByDay(open, today), [open, today])
  const closedGroups = useMemo(() => groupByDay(closed, today), [closed, today])

  const totalOpenCount = useMemo(() => items.filter((item) => !item.done).length, [items])
  const plannedTodayCount = useMemo(() => items.filter((item) => item.date === today && !item.done).length, [items, today])
  const repeatingCount = useMemo(() => items.filter((item) => item.repeat && item.repeat !== 'none').length, [items])
  const totalClosedCount = useMemo(() => items.filter((item) => item.done).length, [items])

  const submit = () => {
    if (!title.trim()) return
    add(kind, title, date, kind === 'task' ? repeat : 'none')
    setTitle('')
    setRepeatInterval('none')
  }

  const renderItem = (item: ProductivityItem, isClosed = false) => {
    const itemRepeat = item.repeat && item.repeat !== 'none' ? item.repeat : 'none'
    const isRecurring = itemRepeat !== 'none'

    return (
      <li key={item.id} className={`point-item${item.done ? ' is-done' : ''}${isRecurring ? ' is-recurring' : ''}`}>
        <label className="point-check">
          <input type="checkbox" checked={item.done} onChange={() => toggle(item.id, today)} />
          <span className="point-box" aria-hidden="true" />
          <span className="visually-hidden">{item.done ? 'Вернуть в работу' : 'Отметить выполненным'}</span>
        </label>

        <div className="point-main">
          <span className="point-title">{item.title}</span>
          {kind === 'task' && !isClosed && (
            <div className={`point-repeat-control${isRecurring ? ' is-active' : ''}`}>
              <Repeat size={12} className="point-repeat-icon" />
              <select
                className="point-repeat-select"
                value={itemRepeat}
                onChange={(event) => setItemRepeat(item.id, event.target.value as RepeatInterval)}
                title="Интервал повторения"
                aria-label={`Повторение задачи: ${item.title}`}
              >
                {REPEAT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id === 'none' ? 'Однократно' : opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {kind === 'task' && isClosed && isRecurring && (
            <span className="point-repeat-badge is-muted" title="Повторяющаяся задача">
              <Repeat size={11} />
              <span>{getRepeatLabel(itemRepeat, lang) || itemRepeat}</span>
            </span>
          )}
        </div>

        <span className="point-move">
          <button
            type="button"
            className="icon-button"
            onClick={() => move(item.id, shiftDate(item.date || today, -1))}
            title="На день раньше"
          >
            <ChevronLeft size={15} />
            <span className="visually-hidden">Перенести на день раньше: {item.title}</span>
          </button>
          <input
            type="date"
            className="point-date"
            value={item.date}
            onChange={(event) => move(item.id, event.target.value)}
            aria-label={`День для «${item.title}»`}
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => move(item.id, shiftDate(item.date || today, 1))}
            title="На день позже"
          >
            <ChevronRight size={15} />
            <span className="visually-hidden">Перенести на день позже: {item.title}</span>
          </button>
        </span>

        <button type="button" className="icon-button point-remove-btn" onClick={() => remove(item.id)} title="Убрать">
          <Trash2 size={15} />
          <span className="visually-hidden">Убрать: {item.title}</span>
        </button>
      </li>
    )
  }

  const renderGroups = (groups: ReturnType<typeof groupByDay>, isClosed = false) =>
    groups.map((group) => {
      const tag = dayTagKind(group.key, today)
      return (
        <section key={group.key || UNTITLED_DAY} className={`point-group tag-${tag}`}>
          <p className={`point-group-title tag-${tag}`}>
            <CalendarDays size={13} />
            <span className="point-group-name">{group.label}</span>
            <span className="point-group-badge">{group.items.length}</span>
          </p>
          <ul className="point-list">{group.items.map((item) => renderItem(item, isClosed))}</ul>
        </section>
      )
    })

  return (
    <div className="point-panel">
      <div className="point-head">
        <div className="point-head-title">
          <h2>{KIND_TITLES[kind]}</h2>
          <span className="point-rate">+{POINTS[kind]} баллов за штуку</span>
        </div>
        <div className="point-stats-bar">
          <div className="point-stat-chip">
            <span className="point-stat-label">В работе</span>
            <span className="point-stat-val">{totalOpenCount}</span>
          </div>
          <div className="point-stat-chip">
            <span className="point-stat-label">На сегодня</span>
            <span className="point-stat-val">{plannedTodayCount}</span>
          </div>
          {kind === 'task' && (
            <div className="point-stat-chip">
              <span className="point-stat-label">Повтор</span>
              <span className="point-stat-val">{repeatingCount}</span>
            </div>
          )}
          <div className="point-stat-chip">
            <span className="point-stat-label">Готово</span>
            <span className="point-stat-val is-accent">{totalClosedCount}</span>
          </div>
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
              type="text"
              value={title}
              placeholder={placeholder}
              onChange={(event) => setTitle(event.target.value)}
              autoComplete="off"
            />
          </label>

          <div className="point-date-controls">
            <label className="point-when">
              <span className="visually-hidden">На какой день</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <div className="point-date-shortcuts">
              <button
                type="button"
                className={`point-date-btn${date === today ? ' is-active' : ''}`}
                onClick={() => setDate(today)}
                title={lang === 'en' ? 'Set for today' : 'Поставить на сегодня'}
              >
                {lang === 'en' ? 'Today' : 'Сегодня'}
              </button>
              <button
                type="button"
                className={`point-date-btn${date === shiftDate(today, 1) ? ' is-active' : ''}`}
                onClick={() => setDate(shiftDate(today, 1))}
                title={lang === 'en' ? 'Set for tomorrow' : 'Поставить на завтра'}
              >
                {lang === 'en' ? 'Tomorrow' : 'Завтра'}
              </button>
              {date && (
                <button
                  type="button"
                  className="point-date-btn is-clear"
                  onClick={() => setDate('')}
                  title={lang === 'en' ? 'Clear date' : 'Очистить дату'}
                >
                  {lang === 'en' ? 'No date' : 'Без даты'}
                </button>
              )}
            </div>
          </div>

          <button type="submit" className="add-button point-add" disabled={!title.trim()}>
            <Plus size={16} /> {lang === 'en' ? 'Add' : 'Добавить'}
          </button>
        </div>

        {kind === 'task' && (
          <div className="point-repeat-row">
            <span className="point-repeat-row-label">
              <Repeat size={13} /> {lang === 'en' ? 'Repeat:' : 'Повторение:'}
            </span>
            <div className="point-repeat-pills" role="radiogroup" aria-label="Повторение задачи">
              {REPEAT_OPTIONS.map((opt) => {
                const isSelected = repeat === opt.id
                const label =
                  opt.id === 'none'
                    ? lang === 'en'
                      ? 'One-time'
                      : 'Однократно'
                    : lang === 'en'
                      ? opt.id === 'daily'
                        ? 'Daily'
                        : opt.id === 'weekdays'
                          ? 'Weekdays'
                          : opt.id === 'weekly'
                            ? 'Weekly'
                            : 'Monthly'
                      : opt.label

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`point-repeat-pill${isSelected ? ' is-selected' : ''}`}
                    onClick={() => {
                      setRepeatInterval(opt.id)
                      if (opt.id !== 'none' && !date) {
                        setDate(today)
                      }
                    }}
                    title={opt.hint}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </form>

      <div className="point-filters">
        <button type="button" className={`mini-button${filter === 'all' ? ' is-on' : ''}`} onClick={() => setFilter('all')}>
          {lang === 'en' ? 'All' : 'Все'} ({totalOpenCount})
        </button>
        <button type="button" className={`mini-button${filter === 'today' ? ' is-on' : ''}`} onClick={() => setFilter('today')}>
          {lang === 'en' ? 'Today only' : 'Только сегодня'} ({plannedTodayCount})
        </button>
        {kind === 'task' && (
          <button type="button" className={`mini-button${filter === 'repeating' ? ' is-on' : ''}`} onClick={() => setFilter('repeating')}>
            {lang === 'en' ? 'Repeating' : 'Повторяющиеся'} ({repeatingCount})
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="point-empty-state">
          <Sparkles size={26} className="point-empty-icon" />
          <p className="point-empty">{empty}</p>
        </div>
      ) : openGroups.length === 0 ? (
        <div className="point-empty-state">
          <CheckCircle2 size={26} className="point-empty-icon" />
          <p className="point-empty">
            {filter === 'today'
              ? 'На сегодня планов нет.'
              : filter === 'repeating'
                ? 'Нет активных повторяющихся задач.'
                : 'Все планы выполнены.'}
          </p>
        </div>
      ) : (
        renderGroups(openGroups, false)
      )}

      {closedGroups.length > 0 && (
        <div className="point-done-section">
          <p className="point-done-title">Выполнено · {closed.length}</p>
          {renderGroups(closedGroups, true)}
        </div>
      )}
    </div>
  )
}

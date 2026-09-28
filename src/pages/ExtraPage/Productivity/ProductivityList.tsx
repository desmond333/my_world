import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import type { ProductivityItem, ProductivityKind } from '../../../data'
import { findCity } from '../../../data'
import { KIND_TITLES, POINTS, UNTITLED_DAY, groupByDay, orderItems, shiftDate } from '../../../lib'
import { getDateForTimezone, useDailyStore, useProductivityStore } from '../../../store'

export type ProductivityListProps = {
  kind: ProductivityKind
  empty: string
  fieldLabel: string
  placeholder: string
}

export const ProductivityList = ({ kind, empty, fieldLabel, placeholder }: ProductivityListProps) => {
  const all = useProductivityStore((state) => state.items)
  const add = useProductivityStore((state) => state.add)
  const toggle = useProductivityStore((state) => state.toggle)
  const move = useProductivityStore((state) => state.move)
  const remove = useProductivityStore((state) => state.remove)
  const cityId = useDailyStore((state) => state.cityId)
  const today = useMemo(() => getDateForTimezone(findCity(cityId).timezone), [cityId])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [onlyToday, setOnlyToday] = useState(false)

  const items = useMemo(() => all.filter((item) => item.kind === kind), [all, kind])
  const visible = useMemo(() => (onlyToday ? items.filter((item) => item.date === today) : items), [items, onlyToday, today])
  const open = useMemo(() => orderItems(visible.filter((item) => !item.done)), [visible])
  const closed = useMemo(() => orderItems(visible.filter((item) => item.done)), [visible])
  const openGroups = useMemo(() => groupByDay(open, today), [open, today])
  const closedGroups = useMemo(() => groupByDay(closed, today), [closed, today])
  const plannedToday = useMemo(() => items.filter((item) => item.date === today && !item.done).length, [items, today])

  const submit = () => {
    if (!title.trim()) return
    add(kind, title, date)
    setTitle('')
  }

  const renderItem = (item: ProductivityItem) => (
    <li key={item.id} className={`point-item${item.done ? ' is-done' : ''}`}>
      <label className="point-check">
        <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
        <span className="point-box" aria-hidden="true" />
        <span className="visually-hidden">{item.done ? 'Вернуть в работу' : 'Отметить выполненным'}</span>
      </label>
      <span className="point-title">{item.title}</span>
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
        <button type="button" className="icon-button" onClick={() => move(item.id, shiftDate(item.date || today, 1))} title="На день позже">
          <ChevronRight size={15} />
          <span className="visually-hidden">Перенести на день позже: {item.title}</span>
        </button>
      </span>
      <button type="button" className="icon-button" onClick={() => remove(item.id)} title="Убрать">
        <Trash2 size={15} />
        <span className="visually-hidden">Убрать: {item.title}</span>
      </button>
    </li>
  )

  const renderGroups = (groups: ReturnType<typeof groupByDay>) =>
    groups.map((group) => (
      <section key={group.key || UNTITLED_DAY} className="point-group">
        <p className="point-group-title">
          <CalendarDays size={13} /> {group.label}
          <span>{group.items.length}</span>
        </p>
        <ul className="point-list">{group.items.map(renderItem)}</ul>
      </section>
    ))

  return (
    <div className="point-panel">
      <div className="point-head">
        <h2>
          {KIND_TITLES[kind]} <span className="point-rate">+{POINTS[kind]} баллов за штуку</span>
        </h2>
        {plannedToday > 0 && <span className="point-today">на сегодня: {plannedToday}</span>}
      </div>

      <form
        className="point-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label className="point-field">
          <span className="visually-hidden">{fieldLabel}</span>
          <input type="text" value={title} placeholder={placeholder} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="point-when">
          <span className="visually-hidden">На какой день</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button type="submit" className="add-button point-add" disabled={!title.trim()}>
          <Plus size={16} /> Добавить
        </button>
      </form>

      <div className="point-filters">
        <button type="button" className={`mini-button${onlyToday ? ' is-on' : ''}`} onClick={() => setOnlyToday((value) => !value)}>
          {onlyToday ? 'показать все' : 'только на сегодня'}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="point-empty">{empty}</p>
      ) : openGroups.length === 0 ? (
        <p className="point-empty">{onlyToday ? 'На сегодня планов нет.' : 'Все планы выполнены.'}</p>
      ) : (
        renderGroups(openGroups)
      )}

      {closedGroups.length > 0 && (
        <>
          <p className="point-done-title">Выполнено · {closed.length}</p>
          {renderGroups(closedGroups)}
        </>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Bike, ChevronLeft, ChevronRight, ClipboardCopy, Dumbbell, Flame, Plus, Settings2, Trash2, Check } from 'lucide-react'
import { findCity } from '../../data'
import { useCopyFeedback } from '../../hooks'
import {
  activeSports,
  daySports,
  formatShortDate,
  monthMatrix,
  monthTitle,
  sportColor,
  sportTotals,
  SPORT_COLORS,
  trainingReport,
  trainingStats,
} from '../../lib'
import { getDateForTimezone, useDailyStore, useTrainingStore } from '../../store'
import type { MonthCursor } from './types'
import './TrainingPage.css'

const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const sportIcon = (id: string) => {
  if (id === 'skate') return <Bike size={15} />
  if (id === 'bike') return <Bike size={15} />
  return <Dumbbell size={15} />
}

export const TrainingPage = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const city = findCity(cityId)
  const today = getDateForTimezone(city.timezone)
  const days = useTrainingStore((state) => state.days)
  const sports = useTrainingStore((state) => state.sports)
  const toggleSport = useTrainingStore((state) => state.toggleSport)
  const setSportEnabled = useTrainingStore((state) => state.setSportEnabled)
  const addSport = useTrainingStore((state) => state.addSport)
  const removeSport = useTrainingStore((state) => state.removeSport)
  const { copied, copyFailed, copy } = useCopyFeedback()

  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const [year, month] = today.split('-').map(Number)
    return { year, month: month - 1 }
  })
  const [picked, setPicked] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(SPORT_COLORS[0])

  const cells = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor])
  const stats = trainingStats(days, today)
  const totals = sportTotals(days, sports).filter((item) => item.count > 0)
  const enabled = activeSports(sports)
  const todayKinds = daySports(days, today)

  const shift = (delta: number) =>
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })

  const copyReport = () => copy(trainingReport(days, today, city.name, sports))

  const submitSport = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    addSport(name, color)
    setName('')
  }

  const sportLabel = (id: string) => sports.find((sport) => sport.id === id)?.label ?? id

  return (
    <div className="training-page">
      <section className="training-head">
        <p className="eyebrow">
          <Dumbbell size={15} /> локальный календарь
        </p>
        <h1>Тренировки</h1>
        <p className="intro">Отмечаешь день — и он остаётся здесь навсегда. Даты считаются по времени {city.name}.</p>
      </section>

      <section className="training-stats" aria-label="Статистика тренировок">
        <div className="stat">
          <span>всего</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat">
          <span>подряд</span>
          <strong>{stats.streak}</strong>
        </div>
        <div className="stat">
          <span>в этом месяце</span>
          <strong>{stats.month}</strong>
        </div>
        <div className="stat">
          <span>последняя</span>
          <strong className="stat-date">
            {stats.last ? monthTitle(Number(stats.last.slice(0, 4)), Number(stats.last.slice(5, 7)) - 1).split(' ')[0] : '—'}
          </strong>
        </div>
      </section>

      {totals.length > 0 && (
        <section className="training-totals" aria-label="Тренировки по видам">
          {totals.map(({ sport, count }) => (
            <span className="training-total" key={sport.id}>
              <i style={{ background: sport.color }} />
              {sport.label} <strong>{count}</strong>
            </span>
          ))}
        </section>
      )}

      <section className="today-training" aria-live="polite">
        <div className="training-today-icon">{todayKinds.length ? <Check size={22} /> : <Dumbbell size={22} />}</div>
        <div>
          <div className="card-kicker">сегодня</div>
          <h2>{todayKinds.length ? todayKinds.map(sportLabel).join(' + ') : 'Тренировок не было'}</h2>
          <p>
            {stats.streak > 0
              ? `Подряд уже ${stats.streak} ${stats.streak === 1 ? 'день' : stats.streak < 5 ? 'дня' : 'дней'}.`
              : 'Отметь день, и появится отметка в календаре.'}
          </p>
        </div>
        <div className="today-sports">
          {enabled.map((sport) => {
            const on = todayKinds.includes(sport.id)
            return (
              <button
                key={sport.id}
                className={`sport-button${on ? ' is-on' : ''}`}
                style={on ? { background: sport.color, borderColor: sport.color, color: '#151717' } : { borderColor: sport.color }}
                onClick={() => toggleSport(today, sport.id)}
                aria-pressed={on}
              >
                {sportIcon(sport.id)} {sport.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="training-settings">
        <div className="training-settings-head">
          <div className="card-kicker">
            <Settings2 size={14} /> настройки
          </div>
          <h2>Виды тренировок</h2>
          <p>Включи то, чем реально занимаешься. Каждому виду — свой цвет, и в дне с несколькими видами календарь покажет их сразу.</p>
        </div>

        <div className="sport-settings">
          {sports.map((sport) => (
            <div className="sport-setting" key={sport.id}>
              <label className="switch-row">
                <span className="switch-text">
                  <span className="sport-name">
                    <i style={{ background: sport.color }} />
                    {sport.label}
                  </span>
                  {sport.custom && <small>свой вид</small>}
                </span>
                <input type="checkbox" checked={sport.enabled} onChange={() => setSportEnabled(sport.id, !sport.enabled)} />
                <i className="switch" aria-hidden="true" />
              </label>
              {sport.custom && (
                <button className="sport-remove" onClick={() => removeSport(sport.id)} aria-label={`Удалить ${sport.label}`}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        <form className="sport-add" onSubmit={submitSport}>
          <input
            type="text"
            value={name}
            placeholder="Свой спорт, например плавание"
            onChange={(event) => setName(event.target.value)}
            maxLength={24}
          />
          <div className="sport-palette">
            {SPORT_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                className={`sport-swatch${color === item ? ' is-on' : ''}`}
                style={{ background: item }}
                onClick={() => setColor(item)}
                aria-label={`Цвет ${item}`}
                aria-pressed={color === item}
              />
            ))}
          </div>
          <button className="add-button" type="submit" disabled={!name.trim()}>
            <Plus size={16} /> Добавить
          </button>
        </form>
      </section>

      <section className="calendar" aria-label="Календарь тренировок">
        <div className="calendar-bar">
          <button className="calendar-nav" onClick={() => shift(-1)} aria-label="Предыдущий месяц">
            <ChevronLeft size={17} />
          </button>
          <h2>{monthTitle(cursor.year, cursor.month)}</h2>
          <button className="calendar-nav" onClick={() => shift(1)} aria-label="Следующий месяц">
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="calendar-week">
          {weekDays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((cell, index) => {
            if (!cell) return <span className="calendar-cell is-empty" key={`empty-${index}`} />
            const kinds = daySports(days, cell.key)
            const future = cell.key > today
            return (
              <button
                className={`calendar-cell${kinds.length ? ' is-done' : ''}${cell.key === today ? ' is-today' : ''}${
                  picked === cell.key ? ' is-picked' : ''
                }`}
                key={cell.key}
                onClick={() => !future && setPicked(picked === cell.key ? '' : cell.key)}
                disabled={future}
                aria-pressed={kinds.length > 0}
                aria-label={`${cell.day} — ${kinds.length ? kinds.map(sportLabel).join(', ') : 'тренировки не было'}`}
              >
                <span>{cell.day}</span>
                {kinds.length > 0 && (
                  <span className="calendar-colors">
                    {kinds.map((id) => (
                      <i key={id} style={{ background: sportColor(sports, id) }} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {picked && (
          <div className="calendar-picker">
            <span className="calendar-picker-date">{formatShortDate(picked)}</span>
            <div className="calendar-picker-sports">
              {sports.map((sport) => {
                const on = daySports(days, picked).includes(sport.id)
                return (
                  <button
                    key={sport.id}
                    className={`sport-chip${on ? ' is-on' : ''}`}
                    style={on ? { background: sport.color, borderColor: sport.color, color: '#151717' } : { borderColor: sport.color }}
                    onClick={() => toggleSport(picked, sport.id)}
                    aria-pressed={on}
                  >
                    {sportIcon(sport.id)} {sport.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <p className="calendar-note">
          <Flame size={14} /> Будущие дни не отмечаются: календарь помнит только то, что уже было.
        </p>
      </section>

      <section className="copy-row">
        <div>
          <div className="card-kicker">выгрузить</div>
          <p>Скопировать весь список тренировок текстом — можно вставить в заметки или в файл.</p>
        </div>
        <button className="copy-button" onClick={copyReport}>
          <ClipboardCopy size={15} /> {copyFailed ? 'Не получилось' : copied ? 'Скопировано' : 'Копировать'}
        </button>
      </section>
    </div>
  )
}

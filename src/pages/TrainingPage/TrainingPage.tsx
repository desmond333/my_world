import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardCopy, Dumbbell, Flame, Heart } from 'lucide-react'
import { findCity } from '../../data'
import { copyToClipboard, monthMatrix, monthTitle, trainingReport, trainingStats } from '../../lib'
import { getDateForTimezone, useDailyStore, useFavoritesStore, useTrainingStore } from '../../store'
import type { MonthCursor } from './types'
import './TrainingPage.css'

const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const COPY_FEEDBACK_MS = 2200

export const TrainingPage = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const city = findCity(cityId)
  const today = getDateForTimezone(city.timezone)
  const days = useTrainingStore((state) => state.days)
  const toggleDay = useTrainingStore((state) => state.toggleDay)
  const favorites = useFavoritesStore((state) => state.favorites)
  const trainingCount = Object.keys(days).length

  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const [year, month] = today.split('-').map(Number)
    return { year, month: month - 1 }
  })
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const cells = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor])
  const stats = trainingStats(days, today)
  const shift = (delta: number) =>
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })

  const copyReport = async () => {
    const ok = await copyToClipboard(trainingReport(days, today, city.name))
    setCopyFailed(!ok)
    setCopied(ok)
    window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, COPY_FEEDBACK_MS)
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Животное дня">
          <span className="brand-mark">
            <Heart size={17} fill="currentColor" />
          </span>
          <span>животное дня</span>
        </Link>
        <div className="header-actions">
          <nav className="main-nav" aria-label="Основная навигация">
            <NavLink to="/">Сегодня</NavLink>
            <NavLink to="/training">Тренировки{trainingCount ? ` · ${trainingCount}` : ''}</NavLink>
            <NavLink to="/favorites">Избранное{favorites.length ? ` · ${favorites.length}` : ''}</NavLink>
          </nav>
        </div>
      </header>

      <section className="training-head">
        <p className="eyebrow">
          <Dumbbell size={15} /> локальный календарь
        </p>
        <h1>Силовые тренировки</h1>
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

      <section className="today-training" aria-live="polite">
        <div className="training-today-icon">{days[today] ? <Check size={22} /> : <Dumbbell size={22} />}</div>
        <div>
          <div className="card-kicker">сегодня</div>
          <h2>{days[today] ? 'Силовая была' : 'Силовой не было'}</h2>
          <p>
            {stats.streak > 0
              ? `Подряд уже ${stats.streak} ${stats.streak === 1 ? 'день' : stats.streak < 5 ? 'дня' : 'дней'}.`
              : 'Отметь день, и появится отметка в календаре.'}
          </p>
        </div>
        <button className={`training-toggle${days[today] ? ' is-done' : ''}`} onClick={() => toggleDay(today)}>
          {days[today] ? 'Отменить отметку' : 'Отметить тренировку'}
        </button>
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
            const done = Boolean(days[cell.key])
            const future = cell.key > today
            return (
              <button
                className={`calendar-cell${done ? ' is-done' : ''}${cell.key === today ? ' is-today' : ''}`}
                key={cell.key}
                onClick={() => !future && toggleDay(cell.key)}
                disabled={future}
                aria-pressed={done}
                aria-label={`${cell.day} — ${done ? 'тренировка отмечена' : 'тренировки не было'}`}
              >
                <span>{cell.day}</span>
                {done && <Check size={12} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
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

      <footer>
        <span>отметки хранятся на этом устройстве</span>
        <span className="footer-note">
          <CalendarDays size={14} /> календарь можно выключить в настройках
        </span>
      </footer>
    </main>
  )
}

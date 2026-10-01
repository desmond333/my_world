import { useMemo, useState } from 'react'
import { Bike, ChevronLeft, ChevronRight, ClipboardCopy, Dumbbell, Flame, PieChart, Plus, Settings2, Trash2, Check } from 'lucide-react'
import { findCity } from '../../data'
import { useCopyFeedback } from '../../hooks'
import { DonutChart, Switch, ViewModeToggle } from '../../shared/ui'
import {
  activeSports,
  daySports,
  formatShortDate,
  monthMatrix,
  monthTitle,
  sportColor,
  sportLabel,
  sportTotals,
  SPORT_COLORS,
  trainingReport,
  trainingStats,
  weekDayLabels,
} from '../../lib'
import { countText, useTranslation } from '../../lib/i18n'
import { getDateForTimezone, useDailyStore, usePageViewMode, useTrainingStore } from '../../store'
import type { MonthCursor } from './types'
import './TrainingPage.css'

const sportIcon = (id: string) => {
  if (id === 'skate') return <Bike size={15} />
  if (id === 'bike') return <Bike size={15} />
  return <Dumbbell size={15} />
}

export const TrainingPage = () => {
  const { lang, t, locale } = useTranslation()
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

  const copyReport = () => copy(trainingReport(days, today, city.name, sports, lang))

  const submitSport = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    addSport(name, color)
    setName('')
  }

  const labelOf = (id: string) => {
    const sport = sports.find((item) => item.id === id)
    return sport ? sportLabel(sport, lang) : id
  }

  const { isNormal, mode, setMode } = usePageViewMode('training')

  return (
    <div className="training-page">
      <section className="training-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">
              <Dumbbell size={15} /> {t('training.kicker')}
            </p>
            <h1>{t('training.title')}</h1>
            <p className="intro">{t('training.intro', undefined, { city: city.name })}</p>
          </div>
          <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
        </div>
      </section>

      <section className="training-stats" aria-label={t('training.statsAria')}>
        <div className="stat">
          <span>{t('training.statTotal')}</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat">
          <span>{t('training.statStreak')}</span>
          <strong>{stats.streak}</strong>
        </div>
        <div className="stat">
          <span>{t('training.statMonth')}</span>
          <strong>{stats.month}</strong>
        </div>
        <div className="stat">
          <span>{t('training.statLast')}</span>
          <strong className="stat-date">
            {stats.last ? monthTitle(Number(stats.last.slice(0, 4)), Number(stats.last.slice(5, 7)) - 1, locale).split(' ')[0] : '—'}
          </strong>
        </div>
      </section>

      <section className="today-training" aria-live="polite">
        <div className="training-today-icon">{todayKinds.length ? <Check size={22} /> : <Dumbbell size={22} />}</div>
        <div>
          <div className="card-kicker">{t('training.today.kicker')}</div>
          <h2>{todayKinds.length ? todayKinds.map(labelOf).join(' + ') : t('training.today.none')}</h2>
          <p>
            {stats.streak > 0
              ? t('training.today.streak', undefined, { count: countText('training.day', stats.streak, lang) })
              : t('training.today.empty')}
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
                {sportIcon(sport.id)} {sportLabel(sport, lang)}
              </button>
            )
          })}
        </div>
      </section>

      {isNormal && (
        <>
          <section className="training-settings">
            <div className="training-settings-head">
              <div className="card-kicker">
                <Settings2 size={14} /> {t('training.settings.kicker')}
              </div>
              <h2>{t('training.settings.title')}</h2>
              <p>{t('training.settings.note')}</p>
            </div>

            <div className="sport-settings">
              {sports.map((sport) => (
                <div className="sport-setting" key={sport.id}>
                  <Switch
                    checked={sport.enabled}
                    onCheckedChange={() => setSportEnabled(sport.id, !sport.enabled)}
                    label={
                      <span className="sport-name">
                        <i style={{ background: sport.color }} />
                        {sportLabel(sport, lang)}
                      </span>
                    }
                    hint={sport.custom ? t('training.settings.custom') : undefined}
                  />
                  {sport.custom && (
                    <button
                      className="sport-remove"
                      onClick={() => removeSport(sport.id)}
                      aria-label={t('training.settings.removeAria', undefined, { label: sportLabel(sport, lang) })}
                    >
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
                placeholder={t('training.settings.placeholder')}
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
                    aria-label={t('training.settings.colorAria', undefined, { color: item })}
                    aria-pressed={color === item}
                  />
                ))}
              </div>
              <button className="add-button" type="submit" disabled={!name.trim()}>
                <Plus size={16} /> {t('common.add')}
              </button>
            </form>
          </section>

          <section className="calendar" aria-label={t('training.calendarAria')}>
            <div className="calendar-bar">
              <button className="calendar-nav" onClick={() => shift(-1)} aria-label={t('training.calendarPrev')}>
                <ChevronLeft size={17} />
              </button>
              <h2>{monthTitle(cursor.year, cursor.month, locale)}</h2>
              <button className="calendar-nav" onClick={() => shift(1)} aria-label={t('training.calendarNext')}>
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="calendar-week">
              {weekDayLabels(locale).map((day) => (
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
                    aria-label={t('training.calendarDayAria', undefined, {
                      day: cell.day,
                      kinds: kinds.length ? kinds.map(labelOf).join(', ') : t('training.calendarDayEmpty'),
                    })}
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
                <span className="calendar-picker-date">{formatShortDate(picked, locale)}</span>
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
                        {sportIcon(sport.id)} {sportLabel(sport, lang)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <p className="calendar-note">
              <Flame size={14} /> {t('training.calendarNote')}
            </p>
          </section>

          {totals.length > 0 && (
            <section className="training-analytics" aria-label={t('training.totalsAria')}>
              <div className="training-analytics-head">
                <div className="card-kicker">
                  <PieChart size={14} /> {t('training.totalsAria')}
                </div>
                <h2>{t('training.totalsAria')}</h2>
              </div>
              <div className="training-analytics-body">
                <DonutChart
                  data={totals.map(({ sport, count }) => ({
                    id: sport.id,
                    label: sportLabel(sport, lang),
                    value: count,
                    color: sport.color,
                  }))}
                  size={120}
                  strokeWidth={14}
                  showLegend={false}
                  centerLabel={t('training.statTotal')}
                  centerValue={stats.total}
                />
                <div className="training-totals">
                  {totals.map(({ sport, count }) => (
                    <span className="training-total" key={sport.id}>
                      <i style={{ background: sport.color }} />
                      {sportLabel(sport, lang)} <strong>{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="copy-row">
            <div>
              <div className="card-kicker">{t('training.copy.kicker')}</div>
              <p>{t('training.copy.note')}</p>
            </div>
            <button className="copy-button" onClick={copyReport}>
              <ClipboardCopy size={15} /> {copyFailed ? t('common.copyFailed') : copied ? t('common.copied') : t('common.copy')}
            </button>
          </section>
        </>
      )}
    </div>
  )
}

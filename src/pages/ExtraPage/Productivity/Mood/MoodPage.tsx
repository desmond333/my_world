import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react'
import { shiftDate } from '../../../../lib/productivity'
import { useTranslation } from '../../../../lib/i18n'
import { getDateForTimezone, useDailyStore, useProductivityStore } from '../../../../store'
import { findCity } from '../../../../data'

const LEVELS = [1, 2, 3, 4, 5] as const

const MOOD_FALLBACK: Record<number, string> = {
  5: 'отлично',
  4: 'хорошо',
  3: 'нормально',
  2: 'плохо',
  1: 'ужасно',
}

export const MoodPage = () => {
  const { t, locale } = useTranslation()
  const mood = useProductivityStore((state) => state.mood)
  const setMood = useProductivityStore((state) => state.setMood)
  const setMoodNote = useProductivityStore((state) => state.setMoodNote)
  const clearMood = useProductivityStore((state) => state.clearMood)
  const cityId = useDailyStore((state) => state.cityId)
  const today = useMemo(() => getDateForTimezone(findCity(cityId).timezone), [cityId])

  const [offset, setOffset] = useState(0)
  const [openDate, setOpenDate] = useState<string | null>(null)

  const days = useMemo(() => Array.from({ length: 30 }, (_, index) => shiftDate(today, index - 29 + offset)), [today, offset])
  const current = openDate ?? today
  const entry = mood[current]

  const dayText = (iso: string) => {
    const parsed = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return iso
    return parsed.toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  }

  const marked = days.filter((day) => mood[day]).length
  const average = useMemo(() => {
    const levels = days.map((day) => mood[day]?.level).filter((level): level is number => Boolean(level))
    if (!levels.length) return null
    return levels.reduce((sum, level) => sum + level, 0) / levels.length
  }, [days, mood])

  return (
    <div className="mood-panel">
      <div className="mood-head">
        <div>
          <h2>{t('productivity.mood.title')}</h2>
          <p className="mood-sub">{t('productivity.mood.subtitle')}</p>
        </div>
        <div className="mood-stats">
          <span className="mood-stat">
            <b>{marked}</b>
            <small>{t('productivity.mood.marked')}</small>
          </span>
          <span className="mood-stat">
            <b>{average ? average.toFixed(1) : '—'}</b>
            <small>{t('productivity.mood.average')}</small>
          </span>
        </div>
      </div>

      <div className="mood-strip-head">
        <button
          type="button"
          className="icon-button"
          onClick={() => setOffset((value) => value - 30)}
          aria-label={t('productivity.mood.prev')}
        >
          <ChevronLeft size={16} />
        </button>
        <span>{t('productivity.mood.range', undefined, { from: dayText(days[0]), to: dayText(days[days.length - 1]) })}</span>
        <button
          type="button"
          className="icon-button"
          onClick={() => setOffset((value) => Math.min(0, value + 30))}
          disabled={offset >= 0}
          aria-label={t('productivity.mood.next')}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mood-strip">
        {days.map((day) => {
          const level = mood[day]?.level
          return (
            <button
              key={day}
              type="button"
              className={`mood-cell${level ? ' is-set' : ''}${day === current ? ' is-current' : ''}`}
              style={level ? ({ '--mood-level': level } as React.CSSProperties) : undefined}
              onClick={() => setOpenDate(day === today ? null : day)}
              title={dayText(day)}
            >
              <span className="mood-cell-day">{Number(day.slice(8, 10))}</span>
              <span className="mood-cell-face">{level ? MOOD_FACE[level] : ''}</span>
            </button>
          )
        })}
      </div>

      <div className="mood-editor">
        <div className="mood-editor-head">
          <CalendarDays size={15} />
          <strong>{dayText(current)}</strong>
          {entry && (
            <button type="button" className="mood-clear" onClick={() => clearMood(current)} title={t('productivity.mood.clear')}>
              <Trash2 size={13} />
              <span className="visually-hidden">{t('productivity.mood.clear')}</span>
            </button>
          )}
        </div>

        <div className="mood-levels" role="group" aria-label={t('productivity.mood.pick')}>
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`mood-level${entry?.level === level ? ' is-on' : ''}`}
              onClick={() => setMood(current, level)}
              title={t(`productivity.mood.level.${level}`, MOOD_FALLBACK[level])}
            >
              <span className="mood-level-face">{MOOD_FACE[level]}</span>
              <span className="mood-level-label">{t(`productivity.mood.level.${level}`, MOOD_FALLBACK[level])}</span>
            </button>
          ))}
        </div>

        <textarea
          className="mood-note"
          value={entry?.note ?? ''}
          onChange={(event) => setMoodNote(current, event.target.value)}
          placeholder={t('productivity.mood.notePlaceholder')}
          rows={3}
          disabled={!entry}
        />
        {!entry && <p className="mood-note-hint">{t('productivity.mood.pickFirst')}</p>}
      </div>

      <p className="mood-legend">
        <Heart size={13} /> {t('productivity.mood.legend')}
      </p>
    </div>
  )
}

const MOOD_FACE: Record<number, string> = { 1: '😖', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' }

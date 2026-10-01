import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cake, Calendar, Plus, Trash2, User } from 'lucide-react'
import { findCity } from '../../../../data'
import { birthdayInfo, birthdayStatusLabel, displayBirthday } from '../../../../lib'
import { countText, useTranslation } from '../../../../lib/i18n'
import { useBirthdayStore, useDailyStore, usePageViewMode } from '../../../../store'
import type { SortedBirthday } from '../../../../features/birthdays'
import './BirthdaysTab.css'

export const BirthdaysTab = () => {
  const { lang, t } = useTranslation()
  const { isSimple } = usePageViewMode('birthdays')
  const birthdays = useBirthdayStore((state) => state.birthdays)
  const addBirthday = useBirthdayStore((state) => state.addBirthday)
  const removeBirthday = useBirthdayStore((state) => state.removeBirthday)
  const cityId = useDailyStore((state) => state.cityId)

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState('')

  const timezone = findCity(cityId).timezone

  const sortedBirthdays = useMemo<SortedBirthday[]>(() => {
    const today = new Date()
    return birthdays
      .map((birthday) => ({ ...birthday, ...birthdayInfo(birthday, today, timezone) }))
      .sort((a, b) => a.next.getTime() - b.next.getTime())
  }, [birthdays, timezone])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !date) {
      setFormError(t('birthday.error'))
      return
    }
    addBirthday(name.trim(), date)
    setName('')
    setDate('')
    setFormError('')
  }

  const isEn = lang === 'en'

  return (
    <div className={`birthdays-panel ${isSimple ? 'is-simple' : ''}`}>
      <div className="birthdays-head">
        <div>
          <h2>{t('birthday.title')}</h2>
        </div>
        <div className="birthdays-stats-bar">
          <span className="birthdays-count-badge">
            <Cake size={14} />
            <span>{countText('birthday.form', birthdays.length, lang)}</span>
          </span>
        </div>
      </div>

      <div className="birthdays-account-notice">
        <div className="birthdays-account-notice-left">
          <Cake size={18} />
          <span>
            {isEn
              ? 'Your personal birthday is now configured directly in your Account.'
              : 'Твой личный день рождения настраивается в твоём Аккаунте.'}
          </span>
        </div>
        <Link to="/auth" className="birthdays-account-link">
          {isEn ? 'Open Account' : 'Перейти в Аккаунт'}
        </Link>
      </div>

      <form className="birthdays-form" onSubmit={handleSave}>
        <label>
          <span>{t('birthday.name')}</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (formError) setFormError('')
            }}
            placeholder={t('birthday.namePlaceholder')}
          />
        </label>
        <label>
          <span>{t('birthday.date')}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              if (formError) setFormError('')
            }}
          />
        </label>
        <button type="submit" className="birthdays-add-btn">
          <Plus size={15} />
          <span>{t('common.add')}</span>
        </button>
      </form>

      {formError && <p className="birthdays-error">{formError}</p>}

      {sortedBirthdays.length === 0 ? (
        <div className="birthdays-empty-state">
          <Calendar size={36} />
          <p>{t('birthday.empty')}</p>
        </div>
      ) : (
        <div className="birthdays-list">
          {sortedBirthdays.map(({ id, name: bName, date: bDate, status }) => (
            <div className="birthday-card-row" key={id}>
              <div className="birthday-card-info">
                <div className="birthday-card-avatar">
                  <User size={16} />
                </div>
                <div className="birthday-card-name-wrap">
                  <span className="birthday-card-name">{bName}</span>
                  <span className="birthday-card-status-badge">{birthdayStatusLabel(status, lang)}</span>
                </div>
              </div>
              <div className="birthday-card-right">
                <time className="birthday-card-date">{displayBirthday(bDate, lang)}</time>
                <button
                  type="button"
                  className="birthday-card-del-btn"
                  onClick={() => removeBirthday(id)}
                  aria-label={t('birthday.deleteAria', undefined, { name: bName })}
                  title={t('birthday.deleteAria', undefined, { name: bName })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

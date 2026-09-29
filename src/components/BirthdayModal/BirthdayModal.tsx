import { useMemo, useState } from 'react'
import { Cake, Trash2, X } from 'lucide-react'
import { findCity } from '../../data'
import { birthdayInfo, birthdayStatusLabel, displayBirthday } from '../../lib'
import { countText, useTranslation } from '../../lib/i18n'
import { useBirthdayStore, useDailyStore } from '../../store'
import type { BirthdayModalProps, SortedBirthday } from './types'
import './BirthdayModal.css'

export const BirthdayModal = ({ onClose }: BirthdayModalProps) => {
  const { lang, t } = useTranslation()
  const ownBirthday = useBirthdayStore((state) => state.ownBirthday)
  const birthdays = useBirthdayStore((state) => state.birthdays)
  const setOwnBirthday = useBirthdayStore((state) => state.setOwnBirthday)
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

  const saveBirthday = () => {
    if (!name.trim() || !date) {
      setFormError(t('birthday.error'))
      return
    }
    addBirthday(name.trim(), date)
    setName('')
    setDate('')
    setFormError('')
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="birthday-modal" role="dialog" aria-modal="true" aria-labelledby="birthday-title">
        <div className="settings-heading">
          <div>
            <span className="card-kicker">{t('birthday.kicker')}</span>
            <h2 id="birthday-title">{t('birthday.title')}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label={t('birthday.close')}>
            <X size={18} />
          </button>
        </div>
        <div className="own-birthday">
          <div>
            <span className="birthday-label">
              <Cake size={14} /> {t('birthday.yourDay')}
            </span>
            <strong>{ownBirthday ? displayBirthday(ownBirthday, lang) : t('birthday.notAdded')}</strong>
          </div>
          <label className="birthday-date-input">
            <span>{ownBirthday ? t('birthday.change') : t('common.add')}</span>
            <input type="date" value={ownBirthday} onChange={(event) => setOwnBirthday(event.target.value)} />
          </label>
        </div>
        <div className="birthday-add">
          <label>
            <span>{t('birthday.name')}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('birthday.namePlaceholder')} />
          </label>
          <label>
            <span>{t('birthday.date')}</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <button className="add-button" onClick={saveBirthday}>
            {t('common.add')}
          </button>
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <div className="reminder-list">
          <div className="list-heading">
            <span>{t('birthday.listHeading')}</span>
            <small>{countText('birthday.form', birthdays.length, lang)}</small>
          </div>
          {sortedBirthdays.length ? (
            sortedBirthdays.map(({ id, name: birthdayName, date: birthdayDate, status }) => (
              <div className="birthday-row" key={id}>
                <div>
                  <strong>{birthdayName}</strong>
                  <span>{birthdayStatusLabel(status, lang)}</span>
                </div>
                <time>{displayBirthday(birthdayDate, lang)}</time>
                <button
                  className="delete-button"
                  onClick={() => removeBirthday(id)}
                  aria-label={t('birthday.deleteAria', undefined, { name: birthdayName })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="empty-birthdays">{t('birthday.empty')}</p>
          )}
        </div>
      </section>
    </div>
  )
}

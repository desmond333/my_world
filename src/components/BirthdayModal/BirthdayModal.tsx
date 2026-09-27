import { useMemo, useState } from 'react'
import { Cake, Trash2, X } from 'lucide-react'
import { findCity } from '../../data'
import { birthdayInfo, displayBirthday } from '../../lib'
import { useBirthdayStore, useDailyStore } from '../../store'
import type { BirthdayModalProps, SortedBirthday } from './types'
import './BirthdayModal.css'

export const BirthdayModal = ({ onClose }: BirthdayModalProps) => {
  const { ownBirthday, birthdays, setOwnBirthday, addBirthday, removeBirthday } = useBirthdayStore()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState('')
  const timezone = findCity(useDailyStore.getState().cityId).timezone
  const sortedBirthdays = useMemo<SortedBirthday[]>(() => {
    const today = new Date()
    return birthdays
      .map((birthday) => ({ ...birthday, ...birthdayInfo(birthday, today, timezone) }))
      .sort((a, b) => a.next.getTime() - b.next.getTime())
  }, [birthdays, timezone])

  const saveBirthday = () => {
    if (!name.trim() || !date) {
      setFormError('Укажи имя и дату рождения.')
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
            <span className="card-kicker">память с заботой</span>
            <h2 id="birthday-title">Дни рождения</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>
        <div className="own-birthday">
          <div>
            <span className="birthday-label">
              <Cake size={14} /> твой день
            </span>
            <strong>{ownBirthday ? displayBirthday(ownBirthday) : 'Дата ещё не добавлена'}</strong>
          </div>
          <label className="birthday-date-input">
            <span>{ownBirthday ? 'Изменить' : 'Добавить'}</span>
            <input type="date" value={ownBirthday} onChange={(event) => setOwnBirthday(event.target.value)} />
          </label>
        </div>
        <div className="birthday-add">
          <label>
            <span>Имя</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Лена" />
          </label>
          <label>
            <span>Дата рождения</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <button className="add-button" onClick={saveBirthday}>
            Добавить
          </button>
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <div className="reminder-list">
          <div className="list-heading">
            <span>не забыть поздравить</span>
            <small>
              {birthdays.length} {birthdays.length === 1 ? 'дата' : 'дат'}
            </small>
          </div>
          {sortedBirthdays.length ? (
            sortedBirthdays.map(({ id, name: birthdayName, date: birthdayDate, status }) => (
              <div className="birthday-row" key={id}>
                <div>
                  <strong>{birthdayName}</strong>
                  <span>{status}</span>
                </div>
                <time>{displayBirthday(birthdayDate)}</time>
                <button className="delete-button" onClick={() => removeBirthday(id)} aria-label={`Удалить ${birthdayName}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="empty-birthdays">Добавь дни рождения близких, чтобы приложение напомнило о них вовремя.</p>
          )}
        </div>
      </section>
    </div>
  )
}

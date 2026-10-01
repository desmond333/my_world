import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarHeart, Clock, Pencil, Plus, Trash2, Users } from 'lucide-react'
import type { AvailabilityScope, AvailabilityWindow, FriendAvailability } from '../../../data'
import { useToday } from '../../../hooks'
import {
  formatShortDate,
  DAY_KEYS,
  groupAvailability,
  isAvailabilityDateValid,
  isAvailabilityRangeValid,
  minutesToTime,
  timeToMinutes,
} from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui'
import { useAuthStore, useAvailabilityStore } from '../../../store'
import './TogetherPage.css'

type FormState = {
  id: string | null
  scope: AvailabilityScope
  dayOfWeek: number
  date: string
  start: string
  end: string
  note: string
}

const EMPTY_FORM: FormState = {
  id: null,
  scope: 'weekly',
  dayOfWeek: 6,
  date: '',
  start: '18:00',
  end: '22:00',
  note: '',
}

export const TogetherPage = () => {
  const { t, locale } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const windows = useAvailabilityStore((state) => state.windows)
  const friends = useAvailabilityStore((state) => state.friends)
  const isLoading = useAvailabilityStore((state) => state.isLoading)
  const isSaving = useAvailabilityStore((state) => state.isSaving)
  const fetchAll = useAvailabilityStore((state) => state.fetchAll)
  const createWindow = useAvailabilityStore((state) => state.createWindow)
  const updateWindow = useAvailabilityStore((state) => state.updateWindow)
  const deleteWindow = useAvailabilityStore((state) => state.deleteWindow)
  const error = useAvailabilityStore((state) => state.error)
  const clearError = useAvailabilityStore((state) => state.clearError)
  const { today } = useToday()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (user) void fetchAll()
  }, [user, fetchAll])

  useEffect(() => {
    if (!isDialogOpen) clearError()
  }, [isDialogOpen, clearError])

  const { weekly, dated } = useMemo(() => groupAvailability(windows), [windows])

  const startMin = timeToMinutes(form.start)
  const endMin = timeToMinutes(form.end)
  const isRangeValid = isAvailabilityRangeValid(startMin, endMin)
  const isDateValid = isAvailabilityDateValid(form.scope, form.date)

  const openCreate = (scope: AvailabilityScope) => {
    setForm({ ...EMPTY_FORM, scope, date: today })
    setIsDialogOpen(true)
  }

  const openEdit = (window: AvailabilityWindow) => {
    setForm({
      id: window.id,
      scope: window.scope,
      dayOfWeek: window.dayOfWeek ?? 6,
      date: window.date ?? today,
      start: minutesToTime(window.startMin),
      end: minutesToTime(window.endMin),
      note: window.note,
    })
    setIsDialogOpen(true)
  }

  const submit = async () => {
    if (!isRangeValid || !isDateValid) return

    const payload = {
      scope: form.scope,
      dayOfWeek: form.scope === 'weekly' ? form.dayOfWeek : null,
      date: form.scope === 'date' ? form.date : null,
      startMin,
      endMin,
      note: form.note.trim(),
    }

    const result = form.id ? await updateWindow(form.id, payload) : await createWindow(payload)
    if (result.success) setIsDialogOpen(false)
  }

  const dayLabel = (day: number, short = false) => t(`together.day.${day}${short ? '.short' : ''}`)

  const renderWindow = (item: AvailabilityWindow) => (
    <article key={item.id} className="together-window">
      <div className="together-window-info">
        <span className="together-window-when">
          <Clock size={13} /> {minutesToTime(item.startMin)} — {minutesToTime(item.endMin)}
        </span>
        {item.scope === 'weekly' && <span className="together-window-day">{dayLabel(item.dayOfWeek ?? 0)}</span>}
        {item.scope === 'date' && item.date && <span className="together-window-day">{formatShortDate(item.date, locale)}</span>}
        {item.note && <span className="together-window-note">{item.note}</span>}
      </div>

      <div className="together-window-actions">
        <button type="button" onClick={() => openEdit(item)} aria-label={t('together.form.edit')}>
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (globalThis.confirm(t('together.action.deleteConfirm'))) void deleteWindow(item.id)
          }}
          aria-label={t('together.action.delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )

  const renderFriend = (friend: FriendAvailability) => (
    <article key={friend.friendId} className="together-friend">
      <h3 className="together-friend-email">{friend.email}</h3>
      {friend.windows.length === 0 ? (
        <p className="together-friend-empty">{t('together.friends.empty')}</p>
      ) : (
        <div className="together-friend-windows">
          {groupAvailability(friend.windows).weekly.map((window) => (
            <div key={window.id} className="together-friend-window">
              <strong>
                {dayLabel(window.dayOfWeek ?? 0, true)} · {minutesToTime(window.startMin)} — {minutesToTime(window.endMin)}
              </strong>
              {window.note && <span>{window.note}</span>}
            </div>
          ))}
          {groupAvailability(friend.windows).dated.map((window) => (
            <div key={window.id} className="together-friend-window is-dated">
              <strong>
                {window.date ? formatShortDate(window.date, locale) : ''} · {minutesToTime(window.startMin)} —{' '}
                {minutesToTime(window.endMin)}
              </strong>
              {window.note && <span>{window.note}</span>}
            </div>
          ))}
        </div>
      )}
    </article>
  )

  return (
    <div className="together-page">
      <header className="extra-head">
        <p className="eyebrow">
          <CalendarHeart size={15} /> {t('together.nav')}
        </p>
        <h1>{t('together.title')}</h1>
        <p className="intro">{t('together.subtitle')}</p>
      </header>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">{t('together.tab.mine')}</TabsTrigger>
          <TabsTrigger value="friends">
            <Users size={14} /> {t('together.tab.friends')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mine">
          {!user ? (
            <div className="together-empty">
              <Users size={30} />
              <p>{t('together.friends.needAuth')}</p>
            </div>
          ) : isLoading ? (
            <div className="together-empty">
              <p>{t('together.loading')}</p>
            </div>
          ) : error ? (
            <div className="together-empty">
              <AlertCircle size={30} />
              <p>{t('together.error.load')}</p>
              <button type="button" className="together-add" onClick={() => void fetchAll()}>
                {t('together.action.retry')}
              </button>
            </div>
          ) : (
            <>
              <section className="together-section">
                <div className="together-section-head">
                  <h2>{t('together.section.weekly')}</h2>
                  <button type="button" className="together-add" onClick={() => openCreate('weekly')}>
                    <Plus size={15} /> {t('together.form.addWeekly')}
                  </button>
                </div>
                {weekly.length === 0 ? (
                  <p className="together-empty-inline">{t('together.weekly.empty')}</p>
                ) : (
                  <div className="together-windows">{weekly.map(renderWindow)}</div>
                )}
              </section>

              <section className="together-section">
                <div className="together-section-head">
                  <h2>{t('together.section.dates')}</h2>
                  <button type="button" className="together-add" onClick={() => openCreate('date')}>
                    <Plus size={15} /> {t('together.form.addDate')}
                  </button>
                </div>
                {dated.length === 0 ? (
                  <p className="together-empty-inline">{t('together.dates.empty')}</p>
                ) : (
                  <div className="together-windows">{dated.map(renderWindow)}</div>
                )}
              </section>
            </>
          )}
        </TabsContent>

        <TabsContent value="friends">
          {!user ? (
            <div className="together-empty">
              <Users size={30} />
              <p>{t('together.friends.needAuth')}</p>
            </div>
          ) : isLoading ? (
            <div className="together-empty">
              <p>{t('together.loading')}</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="together-empty">
              <Users size={30} />
              <p>{t('together.friends.empty')}</p>
            </div>
          ) : (
            <div className="together-friends">{friends.map(renderFriend)}</div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? t('together.form.edit') : form.scope === 'date' ? t('together.form.addDate') : t('together.form.addWeekly')}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="together-form">
              {form.scope === 'weekly' ? (
                <div className="together-form-days">
                  {DAY_KEYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`together-day-btn${form.dayOfWeek === day ? ' is-on' : ''}`}
                      onClick={() => setForm((state) => ({ ...state, dayOfWeek: day }))}
                    >
                      {dayLabel(day, true)}
                    </button>
                  ))}
                </div>
              ) : (
                <label className="together-field">
                  <span>{t('together.form.date')}</span>
                  <input type="date" value={form.date} onChange={(event) => setForm((state) => ({ ...state, date: event.target.value }))} />
                </label>
              )}

              <div className="together-form-row">
                <label className="together-field">
                  <span>{t('together.form.start')}</span>
                  <input
                    type="time"
                    value={form.start}
                    onChange={(event) => setForm((state) => ({ ...state, start: event.target.value }))}
                  />
                </label>
                <label className="together-field">
                  <span>{t('together.form.end')}</span>
                  <input type="time" value={form.end} onChange={(event) => setForm((state) => ({ ...state, end: event.target.value }))} />
                </label>
              </div>

              <label className="together-field">
                <span>{t('together.form.note')}</span>
                <input
                  value={form.note}
                  onChange={(event) => setForm((state) => ({ ...state, note: event.target.value }))}
                  placeholder={t('together.form.notePlaceholder')}
                  maxLength={500}
                />
              </label>

              {!isRangeValid && <p className="together-error">{t('together.form.invalidRange')}</p>}
              {!isDateValid && <p className="together-error">{t('together.form.dateRequired')}</p>}
              {error && <p className="together-error">{t('together.error.save')}</p>}
            </div>
          </DialogBody>

          <DialogFooter>
            <button type="button" className="together-cancel" onClick={() => setIsDialogOpen(false)}>
              {t('together.form.cancel')}
            </button>
            <button
              type="button"
              className="together-submit"
              onClick={() => void submit()}
              disabled={!isRangeValid || !isDateValid || isSaving}
            >
              {t('together.form.save')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

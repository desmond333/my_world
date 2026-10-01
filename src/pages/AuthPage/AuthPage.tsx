import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cake, Cloud, Crown, Lock, LogIn, LogOut, Mail, RefreshCw, ShieldCheck, User, UserPlus } from 'lucide-react'
import { AppTopbar } from '../../widgets'
import { displayBirthday } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { useAuthStore, useBirthdayStore } from '../../store'
import './AuthPage.css'

export const AuthPage = () => {
  const { lang } = useTranslation()
  const isEn = lang === 'en'

  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const lastSyncedAt = useAuthStore((state) => state.lastSyncedAt)
  const isSyncing = useAuthStore((state) => state.isSyncing)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const syncData = useAuthStore((state) => state.syncData)
  const clearError = useAuthStore((state) => state.clearError)
  const ownBirthday = useBirthdayStore((state) => state.ownBirthday)
  const setOwnBirthday = useBirthdayStore((state) => state.setOwnBirthday)

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSyncFeedback(null)

    if (tab === 'login') {
      await login(email, password)
    } else {
      await register(email, password)
    }
  }

  const handleSync = async () => {
    setSyncFeedback(null)
    const ok = await syncData('push')
    if (ok) {
      setSyncFeedback(isEn ? 'Sync completed successfully!' : 'Синхронизация успешно завершена!')
    } else {
      setSyncFeedback(isEn ? 'Sync failed. Check connection.' : 'Ошибка синхронизации. Проверь сеть.')
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return isEn ? 'Never' : 'Никогда'
    return new Date(dateStr).toLocaleString(isEn ? 'en-US' : 'ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge">{user ? <ShieldCheck size={26} /> : <User size={26} />}</div>
            <h1 className="auth-title">
              {user ? (isEn ? 'Your Account' : 'Личный кабинет') : isEn ? 'Cloud Sync & Account' : 'Аккаунт и облачная синхронизация'}
            </h1>
            <p className="auth-subtitle">
              {user
                ? isEn
                  ? 'Your data is connected and synchronized with Cloudflare D1.'
                  : 'Твои данные подключены и синхронизируются с облаком Cloudflare D1.'
                : isEn
                  ? 'Sign in to sync your tasks, notes, habits, and finance across all devices.'
                  : 'Войди, чтобы синхронизировать задачи, заметки, тренировки и финансы между всеми устройствами.'}
            </p>
          </div>

          {user ? (
            <div className="account-profile-box">
              <div className="account-info-grid">
                <div className="account-info-item">
                  <span className="account-info-label">{isEn ? 'Email' : 'Почта'}</span>
                  <span className="account-info-value">{user.email}</span>
                </div>

                <div className="account-info-item">
                  <span className="account-info-label">{isEn ? 'Role' : 'Роль'}</span>
                  <div className={`role-pill ${user.role}`}>
                    {user.role === 'admin' ? <Crown size={13} /> : <User size={13} />}
                    <span>{user.role.toUpperCase()}</span>
                  </div>
                </div>

                <div className="account-info-item">
                  <span className="account-info-label">{isEn ? 'Last Synced' : 'Синхронизировано'}</span>
                  <span className="account-info-value">{formatDate(lastSyncedAt)}</span>
                </div>
              </div>

              {syncFeedback && (
                <div className="auth-notice-box" style={{ borderColor: 'var(--accent)', color: 'var(--fg)' }}>
                  {syncFeedback}
                </div>
              )}

              <div className="account-actions">
                <button type="button" className="sync-action-btn" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw size={16} className={isSyncing ? 'spin-icon' : ''} />
                  <span>
                    {isSyncing ? (isEn ? 'Synchronizing...' : 'Синхронизация...') : isEn ? 'Sync Data Now' : 'Синхронизировать сейчас'}
                  </span>
                </button>

                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-link-btn">
                    <Crown size={16} />
                    <span>{isEn ? 'Open Admin Control Panel' : 'Открыть Панель Администратора'}</span>
                  </Link>
                )}

                <button type="button" className="logout-action-btn" onClick={() => void logout()}>
                  <LogOut size={16} />
                  <span>{isEn ? 'Sign Out' : 'Выйти из аккаунта'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('login')
                    clearError()
                  }}
                >
                  {isEn ? 'Sign In' : 'Вход'}
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('register')
                    clearError()
                  }}
                >
                  {isEn ? 'Create Account' : 'Регистрация'}
                </button>
              </div>

              {error && <div className="auth-error-box">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="auth-email">{isEn ? 'Email Address' : 'Электронная почта'}</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="auth-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="auth-password">{isEn ? 'Password' : 'Пароль'}</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="auth-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      minLength={6}
                      className="auth-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <RefreshCw size={16} className="spin-icon" />
                  ) : tab === 'login' ? (
                    <LogIn size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  <span>
                    {status === 'loading'
                      ? isEn
                        ? 'Processing...'
                        : 'Обработка...'
                      : tab === 'login'
                        ? isEn
                          ? 'Sign In'
                          : 'Войти'
                        : isEn
                          ? 'Create Account'
                          : 'Зарегистрироваться'}
                  </span>
                </button>
              </form>

              <div className="auth-notice-box">
                <Cloud size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {isEn
                  ? 'Offline-first design: all your data stays stored locally in your browser. Registration connects your device to Cloudflare D1 for safe backups and cross-device sync.'
                  : 'Офлайн-first: все данные сохраняются локально в твоём браузере. Регистрация подключает устройство к Cloudflare D1 для бэкапа и синхронизации.'}
              </div>
            </>
          )}
        </div>

        <div className="auth-card auth-birthday-card">
          <div className="auth-birthday-head">
            <div className="auth-birthday-title-group">
              <div className="auth-birthday-badge">
                <Cake size={22} />
              </div>
              <div>
                <h2 className="auth-birthday-title">{isEn ? 'My Birthday' : 'Мой день рождения'}</h2>
                <p className="auth-birthday-subtitle">
                  {isEn
                    ? 'Used for personal celebration on the daily dashboard and special event tags.'
                    : 'Используется для персонального поздравления на главном экране и праздничных отметок.'}
                </p>
              </div>
            </div>
          </div>

          <div className="auth-birthday-body">
            <div className="auth-birthday-current">
              <span className="auth-birthday-label">{isEn ? 'Current date' : 'Установленная дата'}</span>
              <strong>{ownBirthday ? displayBirthday(ownBirthday, lang) : isEn ? 'Not specified yet' : 'Пока не указана'}</strong>
            </div>

            <div className="auth-birthday-controls">
              <input
                type="date"
                className="auth-input auth-birthday-input"
                value={ownBirthday}
                onChange={(e) => setOwnBirthday(e.target.value)}
              />
              {ownBirthday && (
                <button
                  type="button"
                  className="auth-birthday-clear-btn"
                  onClick={() => setOwnBirthday('')}
                  title={isEn ? 'Remove date' : 'Сбросить дату'}
                >
                  {isEn ? 'Clear' : 'Сбросить'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

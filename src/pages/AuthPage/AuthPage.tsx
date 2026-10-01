import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Cake,
  Check,
  Cloud,
  Copy,
  Crown,
  Gift,
  Lock,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Share2,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react'
import { AppTopbar } from '../../widgets'
import { displayBirthday } from '../../lib'
import { useCopyFeedback } from '../../hooks'
import { useTranslation } from '../../lib/i18n'
import { useAuthStore, useBirthdayStore } from '../../store'
import './AuthPage.css'

export const AuthPage = () => {
  const { lang, t, locale } = useTranslation()

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
  const referralStats = useAuthStore((state) => state.referralStats)
  const lastReferralReward = useAuthStore((state) => state.lastReferralReward)
  const referralStatus = useAuthStore((state) => state.referralStatus)
  const fetchReferral = useAuthStore((state) => state.fetchReferral)
  const claimReferralReward = useAuthStore((state) => state.claimReferralReward)
  const clearReferralReward = useAuthStore((state) => state.clearReferralReward)
  const ownBirthday = useBirthdayStore((state) => state.ownBirthday)
  const setOwnBirthday = useBirthdayStore((state) => state.setOwnBirthday)

  const { copy } = useCopyFeedback()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState<'login' | 'register'>(() => (searchParams.get('ref') ? 'register' : 'login'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState(() => searchParams.get('ref')?.trim() ?? '')
  const [referralCopied, setReferralCopied] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (user) void fetchReferral()
  }, [user, fetchReferral])

  const handleCopyReferral = () => {
    if (!referralStats?.code) return
    void copy(referralStats.code)
    setReferralCopied(true)
    window.setTimeout(() => setReferralCopied(false), 2000)
  }

  const handleClaim = async (id: string, type: 'coins' | 'premium') => {
    setClaimingId(id)
    const ok = await claimReferralReward(id, type)
    setClaimingId(null)
    if (!ok) {
      setSyncFeedback(t('premium.referral.claimError'))
      window.setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  const premiumLabel = user?.premium
    ? referralStats?.premiumUntil
      ? t('premium.status.active', undefined, { date: new Date(referralStats.premiumUntil).toLocaleDateString(locale) })
      : t('premium.status.lifetime')
    : t('premium.status.none')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSyncFeedback(null)

    if (tab === 'login') {
      await login(email, password)
    } else {
      await register(email, password, referralCode)
    }
  }

  const handleSync = async () => {
    setSyncFeedback(null)
    const ok = await syncData('push')
    if (ok) {
      setSyncFeedback(t('auth.sync.success'))
    } else {
      setSyncFeedback(t('auth.sync.failed'))
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return t('auth.date.never')
    return new Date(dateStr).toLocaleString(locale, {
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
            <h1 className="auth-title">{user ? t('auth.account.title') : t('auth.title.guest')}</h1>
            <p className="auth-subtitle">{user ? t('auth.subtitle.account') : t('auth.subtitle.guest')}</p>
          </div>

          {user ? (
            <div className="account-profile-box">
              <div className="account-info-grid">
                <div className="account-info-item">
                  <span className="account-info-label">{t('auth.field.emailShort')}</span>
                  <span className="account-info-value">{user.email}</span>
                </div>

                <div className="account-info-item">
                  <span className="account-info-label">{t('auth.field.role')}</span>
                  <div className={`role-pill ${user.role}`}>
                    {user.role === 'admin' ? <Crown size={13} /> : <User size={13} />}
                    <span>{user.role.toUpperCase()}</span>
                  </div>
                </div>

                <div className="account-info-item">
                  <span className="account-info-label">{t('auth.field.lastSynced')}</span>
                  <span className="account-info-value">{formatDate(lastSyncedAt)}</span>
                </div>
              </div>

              {syncFeedback && (
                <div className="auth-notice-box" style={{ borderColor: 'var(--accent)', color: 'var(--fg)' }}>
                  {syncFeedback}
                </div>
              )}

              {lastReferralReward > 0 && (
                <div className="auth-notice-box auth-referral-reward" role="status">
                  <Gift size={16} />
                  <span>{t('premium.refereeReward', undefined, { coins: lastReferralReward })}</span>
                  <button type="button" className="auth-referral-dismiss" onClick={clearReferralReward} aria-label={t('common.dismiss')}>
                    ×
                  </button>
                </div>
              )}

              {referralStatus === 'invalid' && (
                <div className="auth-notice-box auth-referral-invalid" role="status">
                  <Gift size={16} />
                  <span>{t('premium.refereeInvalid')}</span>
                  <button type="button" className="auth-referral-dismiss" onClick={clearReferralReward} aria-label={t('common.dismiss')}>
                    ×
                  </button>
                </div>
              )}

              {referralStats && (
                <div className="auth-referral-box">
                  <div className="auth-referral-head">
                    <Gift size={16} />
                    <strong>{t('premium.referral.title')}</strong>
                    <span className={`auth-premium-badge${user?.premium ? ' is-on' : ''}`}>
                      <Crown size={12} /> {premiumLabel}
                    </span>
                  </div>
                  <p className="auth-referral-desc">{t('premium.referral.desc', undefined, { coins: 1000, months: 2 })}</p>

                  <div className="auth-referral-code-row">
                    <code className="auth-referral-code">{referralStats.code}</code>
                    <button
                      type="button"
                      className="auth-referral-copy"
                      onClick={handleCopyReferral}
                      title={t('premium.referral.copyCode')}
                    >
                      {referralCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      className="auth-referral-share"
                      title={t('premium.referral.copyLink')}
                      onClick={() => void copy(`${window.location.origin}/auth?ref=${referralStats.code}`)}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>

                  <div className="auth-referral-stats">
                    <span>{t('premium.referral.invited', undefined, { count: referralStats.invited })}</span>
                    <span>{t('premium.referral.earned', undefined, { count: referralStats.earned })}</span>
                  </div>

                  {referralStats.pending.length > 0 ? (
                    <div className="auth-referral-claims">
                      <span className="auth-referral-claims-title">
                        {t('premium.referral.pendingTitle', undefined, { count: referralStats.pending.length })}
                      </span>
                      {referralStats.pending.map((item) => (
                        <div key={item.id} className="auth-referral-claim-row">
                          <button
                            type="button"
                            className="auth-referral-claim-btn"
                            disabled={claimingId === item.id}
                            onClick={() => void handleClaim(item.id, 'coins')}
                          >
                            {claimingId === item.id
                              ? t('premium.referral.claiming')
                              : t('premium.referral.claimCoins', undefined, { coins: 1000 })}
                          </button>
                          <button
                            type="button"
                            className="auth-referral-claim-btn is-premium"
                            disabled={claimingId === item.id}
                            onClick={() => void handleClaim(item.id, 'premium')}
                          >
                            {t('premium.referral.claimPremium', undefined, { months: 2 })}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="auth-referral-empty">{t('premium.referral.empty')}</p>
                  )}
                </div>
              )}

              <div className="account-actions">
                <button type="button" className="sync-action-btn" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw size={16} className={isSyncing ? 'spin-icon' : ''} />
                  <span>{isSyncing ? t('auth.sync.syncing') : t('auth.sync.now')}</span>
                </button>

                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-link-btn">
                    <Crown size={16} />
                    <span>{t('auth.adminPanel')}</span>
                  </Link>
                )}

                <button type="button" className="logout-action-btn" onClick={() => void logout()}>
                  <LogOut size={16} />
                  <span>{t('auth.logout')}</span>
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
                  {t('auth.tab.login')}
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('register')
                    clearError()
                  }}
                >
                  {t('auth.tab.register')}
                </button>
              </div>

              {error && <div className="auth-error-box">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="auth-email">{t('auth.field.email')}</label>
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
                  <label htmlFor="auth-password">{t('auth.field.password')}</label>
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

                {tab === 'register' && (
                  <div className="auth-field">
                    <label htmlFor="auth-referral">{t('premium.referral.inputLabel')}</label>
                    <div className="auth-input-wrapper">
                      <Gift size={16} className="auth-input-icon" />
                      <input
                        id="auth-referral"
                        type="text"
                        placeholder="ABC12345"
                        className="auth-input"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                )}

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
                      ? t('auth.submit.processing')
                      : tab === 'login'
                        ? t('auth.submit.login')
                        : t('auth.submit.register')}
                  </span>
                </button>
              </form>

              <div className="auth-notice-box">
                <Cloud size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {t('auth.notice.offline')}
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
                <h2 className="auth-birthday-title">{t('auth.birthday.title')}</h2>
                <p className="auth-birthday-subtitle">{t('auth.birthday.desc')}</p>
              </div>
            </div>
          </div>

          <div className="auth-birthday-body">
            <div className="auth-birthday-current">
              <span className="auth-birthday-label">{t('auth.birthday.current')}</span>
              <strong>{ownBirthday ? displayBirthday(ownBirthday, lang) : t('auth.birthday.none')}</strong>
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
                  title={t('auth.birthday.remove')}
                >
                  {t('auth.birthday.clear')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

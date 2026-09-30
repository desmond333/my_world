import { Link, useLocation } from 'react-router-dom'
import { Coins, Crown, Monitor, Moon, Settings, Sun, User, Users } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { useAuthStore, useDailyStore, useFriendsStore, useShopStore } from '../../store'
import './TopbarControls.css'

export const TopbarControls = () => {
  const location = useLocation()
  const { lang, setLang, t } = useTranslation()
  const themeMode = useDailyStore((state) => state.themeMode ?? 'system')
  const setThemeMode = useDailyStore((state) => state.setThemeMode)
  const coins = useShopStore((state) => state.coins)
  const user = useAuthStore((state) => state.user)
  const openFriendsModal = useFriendsStore((state) => state.openModal)
  const incomingRequestsCount = useFriendsStore((state) => state.incoming.length)

  const cycleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('light')
    } else if (themeMode === 'light') {
      setThemeMode('dark')
    } else {
      setThemeMode('system')
    }
  }

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun size={15} />
      case 'dark':
        return <Moon size={15} />
      case 'system':
      default:
        return <Monitor size={15} />
    }
  }

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return t('theme.light')
      case 'dark':
        return t('theme.dark')
      case 'system':
      default:
        return t('theme.system')
    }
  }

  return (
    <div className="topbar-controls">
      <div className="lang-pill" role="group" aria-label={t('topbar.lang')}>
        <button
          type="button"
          className={`lang-pill-btn ${lang === 'ru' ? 'active' : ''}`}
          onClick={() => setLang('ru')}
          title={t('topbar.langRu')}
          aria-pressed={lang === 'ru'}
        >
          RU
        </button>
        <button
          type="button"
          className={`lang-pill-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
          title={t('topbar.langEn')}
          aria-pressed={lang === 'en'}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        className="theme-cycle-btn"
        onClick={cycleTheme}
        title={`${t('topbar.theme')}: ${getThemeLabel()} (${t('topbar.themeCycle')})`}
        aria-label={`${t('topbar.theme')}: ${getThemeLabel()}`}
      >
        <span className="theme-cycle-icon">{getThemeIcon()}</span>
        <span className="theme-cycle-label">{getThemeLabel()}</span>
      </button>

      <Link
        to="/shop"
        className={`shop-link-btn ${location.pathname === '/shop' ? 'is-active' : ''}`}
        title={lang === 'en' ? 'Royal Shop & Treasury' : 'Магазин и казна'}
        aria-label={lang === 'en' ? 'Shop' : 'Магазин'}
      >
        <Coins size={14} className="shop-link-icon" />
        <span className="shop-link-coins">{coins.toLocaleString()}</span>
      </Link>

      <button
        type="button"
        className="settings-link-btn"
        onClick={() => openFriendsModal()}
        title={t('friends.title')}
        aria-label={t('friends.title')}
        style={{ position: 'relative' }}
      >
        <Users size={15} />
        {incomingRequestsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--coral)',
            }}
          />
        )}
      </button>

      <Link
        to="/settings"
        className={`settings-link-btn ${location.pathname === '/settings' ? 'is-active' : ''}`}
        title={t('settings.title')}
        aria-label={t('settings.title')}
      >
        <Settings size={15} />
      </Link>

      <Link
        to={user?.role === 'admin' ? '/admin' : '/auth'}
        className={`settings-link-btn ${location.pathname === '/auth' || location.pathname === '/admin' ? 'is-active' : ''}`}
        title={
          user
            ? `${user.role === 'admin' ? '👑 Admin: ' : '👤 '}${user.email}`
            : lang === 'en'
              ? 'Cloud Sync & Sign In'
              : 'Вход и синхронизация'
        }
        aria-label="Account"
      >
        {user?.role === 'admin' ? <Crown size={15} color="var(--accent)" /> : <User size={15} />}
      </Link>
    </div>
  )
}

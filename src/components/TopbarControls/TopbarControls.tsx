import { Link, useLocation } from 'react-router-dom'
import { Coins, Monitor, Moon, Settings, Sun } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore, useShopStore } from '../../store'
import './TopbarControls.css'

export const TopbarControls = () => {
  const location = useLocation()
  const { lang, setLang, t } = useTranslation()
  const themeMode = useDailyStore((state) => state.themeMode ?? 'system')
  const setThemeMode = useDailyStore((state) => state.setThemeMode)
  const coins = useShopStore((state) => state.coins)

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

      <Link
        to="/settings"
        className={`settings-link-btn ${location.pathname === '/settings' ? 'is-active' : ''}`}
        title={t('settings.title')}
        aria-label={t('settings.title')}
      >
        <Settings size={15} />
      </Link>
    </div>
  )
}

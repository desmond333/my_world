import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import './TopbarControls.css'

export const TopbarControls = () => {
  const { lang, setLang, t } = useTranslation()
  const themeMode = useDailyStore((state) => state.themeMode ?? 'system')
  const setThemeMode = useDailyStore((state) => state.setThemeMode)

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
    </div>
  )
}

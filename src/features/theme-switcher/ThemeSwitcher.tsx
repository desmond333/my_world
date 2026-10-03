import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { Tooltip } from '../../shared/ui'
import { useDailyStore } from '../../store'

export const ThemeSwitcher = () => {
  const { t } = useTranslation()
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
    <Tooltip content={`${t('topbar.theme')}: ${getThemeLabel()} (${t('topbar.themeCycle')})`}>
      <button type="button" className="theme-cycle-btn" onClick={cycleTheme} aria-label={`${t('topbar.theme')}: ${getThemeLabel()}`}>
        <span className="theme-cycle-icon">{getThemeIcon()}</span>
        <span className="theme-cycle-label">{getThemeLabel()}</span>
      </button>
    </Tooltip>
  )
}

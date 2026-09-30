import { Settings } from 'lucide-react'
import { AppTopbar } from '../../../components/AppTopbar/AppTopbar'
import { formatFullDate } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { ViewModeToggle } from '../../../shared/ui'
import { usePageViewMode } from '../../../store'
import type { TopbarProps } from '../types'

export const Topbar = ({ city, now, settingsOpen, onToggleSettings }: TopbarProps) => {
  const { t, locale } = useTranslation()
  const { mode, setMode } = usePageViewMode('today')

  return (
    <AppTopbar>
      <div className="date-stamp">
        <span className="live-dot" /> {city.name} · {formatFullDate(now, city.timezone, locale)}
      </div>
      <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
      <button className="settings-button" onClick={onToggleSettings} aria-expanded={settingsOpen} aria-controls="settings-panel">
        <Settings size={17} />
        <span>{t('topbar.settings')}</span>
      </button>
    </AppTopbar>
  )
}

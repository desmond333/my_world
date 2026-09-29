import { Settings } from 'lucide-react'
import { AppTopbar } from '../../../components/AppTopbar/AppTopbar'
import { formatFullDate } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import type { TopbarProps } from '../types'

export const Topbar = ({ city, now, settingsOpen, onToggleSettings }: TopbarProps) => {
  const { t, locale } = useTranslation()

  return (
    <AppTopbar>
      <div className="date-stamp">
        <span className="live-dot" /> {city.name} · {formatFullDate(now, city.timezone, locale)}
      </div>
      <button className="settings-button" onClick={onToggleSettings} aria-expanded={settingsOpen} aria-controls="settings-panel">
        <Settings size={17} />
        <span>{t('topbar.settings')}</span>
      </button>
    </AppTopbar>
  )
}

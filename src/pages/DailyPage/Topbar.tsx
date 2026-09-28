import { Settings } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { formatFullDate } from '../../lib'
import type { TopbarProps } from './types'

export const Topbar = ({ city, now, settingsOpen, onToggleSettings }: TopbarProps) => (
  <AppTopbar>
    <div className="date-stamp">
      <span className="live-dot" /> {city.name} · {formatFullDate(now, city.timezone)}
    </div>
    <button className="settings-button" onClick={onToggleSettings} aria-expanded={settingsOpen} aria-controls="settings-panel">
      <Settings size={17} />
      <span>Настроить</span>
    </button>
  </AppTopbar>
)

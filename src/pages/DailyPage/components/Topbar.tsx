import { SlidersHorizontal } from 'lucide-react'
import { AppTopbar } from '../../../widgets'
import { formatFullDate } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { ViewModeToggle } from '../../../shared/ui'
import { usePageViewMode } from '../../../store'
import type { TopbarProps } from '../types'

export const Topbar = ({ city, now, settingsOpen, onToggleSettings }: TopbarProps) => {
  const { t, locale } = useTranslation()
  const { mode, setMode } = usePageViewMode('today')

  return (
    <>
      <AppTopbar />
      <div className="daily-toolbar" aria-label={t('daily.infoAria')}>
        <div className="daily-toolbar-date">
          <span className="live-dot" />
          <span>
            <strong>{city.name}</strong> · {formatFullDate(now, city.timezone, locale)}
          </span>
        </div>
        <div className="daily-toolbar-actions">
          <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
          <button
            type="button"
            className={`daily-settings-btn${settingsOpen ? ' is-active' : ''}`}
            onClick={onToggleSettings}
            aria-expanded={settingsOpen}
            aria-controls="settings-panel"
            title={t('topbar.settings')}
          >
            <SlidersHorizontal size={14} />
            <span>{t('topbar.settings')}</span>
          </button>
        </div>
      </div>
    </>
  )
}

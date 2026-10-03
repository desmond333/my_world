import { MonitorSmartphone } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

export const DesktopHint = () => {
  const { t } = useTranslation()

  return (
    <p className="desktop-hint">
      <MonitorSmartphone size={17} />
      <span>{t('daily.desktopHint')}</span>
    </p>
  )
}

import { MonitorSmartphone, Thermometer } from 'lucide-react'
import { CreatorNote } from '../../../components/CreatorNote/CreatorNote'
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

export const DailyFooter = () => {
  const { t } = useTranslation()

  return (
    <footer>
      <span>{t('daily.footer.new')}</span>
      <span className="footer-note">
        <Thermometer size={14} /> {t('daily.footer.auto')}
      </span>
      <CreatorNote />
    </footer>
  )
}

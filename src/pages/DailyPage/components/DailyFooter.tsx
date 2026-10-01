import { MonitorSmartphone, Thermometer } from 'lucide-react'
import { AppFooter } from '../../../widgets'
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
    <AppFooter
      leftText={t('daily.footer.new')}
      note={
        <>
          <Thermometer size={14} /> {t('daily.footer.auto')}
        </>
      }
    />
  )
}

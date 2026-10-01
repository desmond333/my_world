import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from '../../../lib/i18n'
import './PwaUpdater.css'

export const PwaUpdater = () => {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="pwa-update" role="status">
      <span>{t('pwa.updateReady')}</span>
      <button type="button" className="pwa-update-btn" onClick={() => void updateServiceWorker(true)}>
        {t('pwa.updateAction')}
      </button>
      <button type="button" className="pwa-update-close" onClick={() => setNeedRefresh(false)} aria-label={t('pwa.dismiss')}>
        ×
      </button>
    </div>
  )
}

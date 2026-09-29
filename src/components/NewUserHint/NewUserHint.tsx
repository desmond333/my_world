import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles, X } from 'lucide-react'
import { storage } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import './NewUserHint.css'

const ONBOARDING_KEY = 'myworld_onboarding_hint_seen'

export const NewUserHint = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isSeen = storage.get<boolean>(ONBOARDING_KEY, false)
    if (!isSeen) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    storage.set(ONBOARDING_KEY, true)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside className="new-user-hint-overlay" aria-label={t('hint.aria')}>
      <div className="new-user-hint-card">
        <div className="hint-header">
          <div className="hint-badge-row">
            <Sparkles size={18} className="hint-sparkle-icon" />
            <h3 className="hint-title">{t('hint.title')}</h3>
          </div>
          <button type="button" className="hint-close-btn" onClick={handleDismiss} aria-label={t('hint.close')}>
            <X size={16} />
          </button>
        </div>

        <p className="hint-body">
          {t('hint.body.lead')}
          <strong>{t('hint.body.list')}</strong>
          {t('hint.body.middle')}
          <strong>{t('hint.body.settings')}</strong>
          {t('hint.body.tail')}
        </p>

        <div className="hint-actions">
          <button type="button" className="hint-btn-primary" onClick={handleDismiss}>
            <Check size={14} /> {t('hint.gotIt')}
          </button>
          <Link to="/misc/fun" className="hint-btn-secondary" onClick={handleDismiss}>
            {t('hint.goFun')}
          </Link>
        </div>
      </div>
    </aside>
  )
}

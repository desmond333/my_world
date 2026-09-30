import { Feather, Sparkles } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { ViewMode } from '../../../store'
import './ViewModeToggle.css'

export type ViewModeToggleProps = {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  size?: 'sm' | 'md'
  variant?: 'segmented' | 'switch'
  className?: string
  ariaLabel?: string
}

export const ViewModeToggle = ({ mode, onChange, size = 'md', variant = 'segmented', className = '', ariaLabel }: ViewModeToggleProps) => {
  const { t } = useTranslation()

  if (variant === 'switch') {
    const isNormal = mode === 'normal'

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isNormal}
        aria-label={ariaLabel ?? t('settings.viewMode.title')}
        className={`view-mode-switch size-${size} ${isNormal ? 'is-normal' : 'is-simple'} ${className}`.trim()}
        onClick={() => onChange(isNormal ? 'simple' : 'normal')}
      >
        <span className="view-mode-switch-track">
          <span className="view-mode-switch-thumb">
            {isNormal ? <Sparkles size={size === 'sm' ? 12 : 14} /> : <Feather size={size === 'sm' ? 12 : 14} />}
          </span>
        </span>
        <span className="view-mode-switch-label">{isNormal ? t('settings.viewMode.normalShort') : t('settings.viewMode.simpleShort')}</span>
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? t('settings.viewMode.title')}
      className={`view-mode-toggle size-${size} ${className}`.trim()}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'simple'}
        className={`view-mode-btn ${mode === 'simple' ? 'is-active' : ''}`}
        onClick={() => onChange('simple')}
        title={t('settings.viewMode.simpleDesc')}
      >
        <Feather size={size === 'sm' ? 12 : 13} />
        <span>{t('settings.viewMode.simpleShort')}</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'normal'}
        className={`view-mode-btn ${mode === 'normal' ? 'is-active' : ''}`}
        onClick={() => onChange('normal')}
        title={t('settings.viewMode.normalDesc')}
      >
        <Sparkles size={size === 'sm' ? 12 : 13} />
        <span>{t('settings.viewMode.normalShort')}</span>
      </button>
    </div>
  )
}

import { Feather, Sparkles } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { ViewMode } from '../../../data'
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup'
import { Tooltip } from '../Tooltip/Tooltip'
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
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(val) => {
        if (val) onChange(val as ViewMode)
      }}
      aria-label={ariaLabel ?? t('settings.viewMode.title')}
      className={`view-mode-toggle size-${size} ${className}`.trim()}
    >
      <Tooltip content={t('settings.viewMode.simpleDesc')}>
        <ToggleGroupItem
          value="simple"
          className={`view-mode-btn ${mode === 'simple' ? 'is-active' : ''}`}
          aria-label={t('settings.viewMode.simpleShort')}
        >
          <Feather size={size === 'sm' ? 12 : 13} />
          <span>{t('settings.viewMode.simpleShort')}</span>
        </ToggleGroupItem>
      </Tooltip>
      <Tooltip content={t('settings.viewMode.normalDesc')}>
        <ToggleGroupItem
          value="normal"
          className={`view-mode-btn ${mode === 'normal' ? 'is-active' : ''}`}
          aria-label={t('settings.viewMode.normalShort')}
        >
          <Sparkles size={size === 'sm' ? 12 : 13} />
          <span>{t('settings.viewMode.normalShort')}</span>
        </ToggleGroupItem>
      </Tooltip>
    </ToggleGroup>
  )
}

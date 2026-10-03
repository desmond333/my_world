import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { useFeature } from '../../hooks'
import type { FeatureId } from '../../lib/features'
import { PremiumGate } from '../../shared/ui'

export type FeatureGateProps = {
  feature: FeatureId
  children: ReactNode
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const FeatureGate = ({ feature, children, title, description, actionLabel, onAction }: FeatureGateProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { unlocked, labelKey, descriptionKey } = useFeature(feature)

  if (unlocked) return <>{children}</>

  return (
    <PremiumGate
      locked
      title={title ?? t('feature.lockedTitle', undefined, { name: t(labelKey) })}
      description={description ?? (descriptionKey ? t(descriptionKey) : undefined)}
      actionLabel={actionLabel ?? t('feature.unlockCta')}
      onAction={onAction ?? (() => navigate('/shop'))}
    >
      {children}
    </PremiumGate>
  )
}

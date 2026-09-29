import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

export type ComingSoonProps = {
  icon: LucideIcon
  kicker: string
  heading: string
  description: string
}

export const ComingSoon = ({ icon: Icon, kicker, heading, description }: ComingSoonProps) => {
  const { t } = useTranslation()

  return (
    <section className="placeholder-card">
      <p className="eyebrow">
        <Icon size={15} /> {kicker}
      </p>
      <h2>{heading}</h2>
      <p className="placeholder-text">{description}</p>
      <p className="placeholder-note">
        <Construction size={15} /> {t('comingSoon.note')}
      </p>
    </section>
  )
}

import { Coffee } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { WishCardProps } from '../types'

export const WishCard = ({ wish }: WishCardProps) => {
  const { t } = useTranslation()

  return (
    <section className="wish-card" aria-live="polite">
      <div className="wish-icon">
        <Coffee size={21} />
      </div>
      <div>
        <div className="card-kicker">{t('wish.kicker')}</div>
        <h2>{wish}</h2>
        <p>{t('wish.note')}</p>
      </div>
    </section>
  )
}

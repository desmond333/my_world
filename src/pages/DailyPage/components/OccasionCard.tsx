import { Cake } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { OccasionCardProps } from '../types'

export const OccasionCard = ({ holiday, loading, occasion, cityName }: OccasionCardProps) => {
  const { t } = useTranslation()

  return (
    <section className="holiday-card" aria-live="polite">
      <div className="holiday-icon">
        <Cake size={22} />
      </div>
      <div>
        <div className="card-kicker">
          {holiday ? t('occasion.holiday') : occasion.isThemed ? t('occasion.themed') : t('occasion.daily')}
        </div>
        <h2>{loading ? t('occasion.loading') : holiday ? holiday.localName : occasion.title}</h2>
        <p>{holiday ? t('occasion.holidayNote') : t('occasion.dailyNote')}</p>
      </div>
      <span className="holiday-city">{cityName}</span>
    </section>
  )
}

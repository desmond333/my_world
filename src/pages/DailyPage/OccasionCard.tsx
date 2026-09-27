import { Cake } from 'lucide-react'
import type { OccasionCardProps } from './types'

export const OccasionCard = ({ holiday, loading, occasion, cityName }: OccasionCardProps) => (
  <section className="holiday-card" aria-live="polite">
    <div className="holiday-icon">
      <Cake size={22} />
    </div>
    <div>
      <div className="card-kicker">{holiday ? 'официальный праздник' : occasion.isThemed ? 'тематический день' : 'повод дня'}</div>
      <h2>{loading ? 'Ищем повод для праздника...' : holiday ? holiday.localName : occasion.title}</h2>
      <p>{holiday ? 'Самое время поздравить тех, кто рядом.' : 'Официальных праздников сегодня нет, но повод всегда найдётся.'}</p>
    </div>
    <span className="holiday-city">{cityName}</span>
  </section>
)

import { Coffee } from 'lucide-react'
import type { WishCardProps } from './types'

export const WishCard = ({ wish }: WishCardProps) => (
  <section className="wish-card" aria-live="polite">
    <div className="wish-icon">
      <Coffee size={21} />
    </div>
    <div>
      <div className="card-kicker">пожелание дня</div>
      <h2>{wish}</h2>
      <p>Не от животного и не от календаря. Просто на удачу.</p>
    </div>
  </section>
)

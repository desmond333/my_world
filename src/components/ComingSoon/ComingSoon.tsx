import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'

export type ComingSoonProps = {
  icon: LucideIcon
  kicker: string
  heading: string
  description: string
}

export const ComingSoon = ({ icon: Icon, kicker, heading, description }: ComingSoonProps) => (
  <section className="placeholder-card">
    <p className="eyebrow">
      <Icon size={15} /> {kicker}
    </p>
    <h2>{heading}</h2>
    <p className="placeholder-text">{description}</p>
    <p className="placeholder-note">
      <Construction size={15} /> Раздел пустой. Функциональность появится позже, вкладка уже на месте.
    </p>
  </section>
)

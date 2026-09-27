import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { BreedCardProps } from './types'

export const BreedCard = ({ animal }: BreedCardProps) => (
  <div className="breed-card">
    <div className="card-kicker">порода / вид</div>
    <h2>{animal.breed}</h2>
    <p>{animal.facts}</p>
    <details>
      <summary>
        Узнать об этом виде <span className="plus">+</span>
      </summary>
      <p className="breed-description">{animal.description}</p>
      <div className="breed-specs">
        <div>
          <span>средний вес</span>
          <strong>{animal.weight}</strong>
        </div>
        <div>
          <span>сколько живёт</span>
          <strong>{animal.lifespan}</strong>
        </div>
        <div>
          <span>где обитает</span>
          <strong>{animal.habitat}</strong>
        </div>
      </div>
      <div className="breed-links">
        <Link className="more-button" to={`/animal/${animal.id}`}>
          вся страница о виде
        </Link>
        <a className="more-button" href={animal.wikiUrl} target="_blank" rel="noreferrer noopener">
          <ExternalLink size={14} /> википедия
        </a>
      </div>
    </details>
  </div>
)

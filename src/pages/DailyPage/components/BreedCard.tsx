import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../shared/ui'
import type { BreedCardProps } from '../types'

export const BreedCard = ({ animal }: BreedCardProps) => {
  const { t } = useTranslation()

  return (
    <div className="breed-card">
      <div className="card-kicker">{t('breed.kicker')}</div>
      <h2>{animal.breed}</h2>
      <p>
        {animal.species}
        {animal.facts ? ` · ${animal.facts}` : ''}
      </p>
      <Accordion type="single" collapsible className="breed-accordion">
        <AccordionItem value="details" className="breed-accordion-item">
          <AccordionTrigger className="breed-accordion-trigger">{t('breed.details')}</AccordionTrigger>
          <AccordionContent className="breed-accordion-content">
            <div className="breed-meta">
              <div>
                <span>{t('breed.lifespan')}</span>
                <strong>{animal.lifespan}</strong>
              </div>
              <div>
                <span>{t('breed.weight')}</span>
                <strong>{animal.weight}</strong>
              </div>
              <div className="breed-habitat">
                <span>{t('breed.habitat')}</span>
                <strong>{animal.habitat}</strong>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="card-bottom">
        <Link className="species-link" to={`/animal/${animal.id}`}>
          {t('breed.fullDescription')} <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  )
}

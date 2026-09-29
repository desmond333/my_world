import { Link } from 'react-router-dom'
import { Check, ClipboardCopy, Dumbbell } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { TrainingCardProps } from '../types'

export const TrainingCard = ({ trainedToday, copied, copyFailed, onToggle, onCopy }: TrainingCardProps) => {
  const { t } = useTranslation()

  return (
    <section className="training-card" aria-live="polite">
      <div className="training-icon">{trainedToday ? <Check size={22} /> : <Dumbbell size={22} />}</div>
      <div className="training-body">
        <div className="card-kicker">{t('trainingCard.kicker')}</div>
        <h2>{trainedToday ? t('trainingCard.doneTitle') : t('trainingCard.logTitle')}</h2>
        <p>{trainedToday ? t('trainingCard.doneNote') : t('trainingCard.logNote')}</p>
        <div className="training-actions">
          <button className={`training-toggle${trainedToday ? ' is-done' : ''}`} onClick={onToggle}>
            {trainedToday ? t('trainingCard.done') : t('trainingCard.log')}
          </button>
          <Link className="more-button" to="/extra/training">
            {t('trainingCard.calendar')}
          </Link>
          <button className="more-button" onClick={onCopy}>
            <ClipboardCopy size={14} /> {copyFailed ? t('common.copyFailed') : copied ? t('common.copied') : t('common.copy')}
          </button>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { Check, ClipboardCopy, Dumbbell } from 'lucide-react'
import type { TrainingCardProps } from './types'

export const TrainingCard = ({ trainedToday, copied, copyFailed, onToggle, onCopy }: TrainingCardProps) => (
  <section className="training-card" aria-live="polite">
    <div className="training-icon">{trainedToday ? <Check size={22} /> : <Dumbbell size={22} />}</div>
    <div className="training-body">
      <div className="card-kicker">силовая тренировка</div>
      <h2>{trainedToday ? 'Сегодня тренировались' : 'Отметь тренировку'}</h2>
      <p>
        {trainedToday
          ? 'Отметка есть в календаре. Если это была не силовая — просто сними галочку.'
          : 'Работал? Отметь, и день появится в календаре тренировок.'}
      </p>
      <div className="training-actions">
        <button className={`training-toggle${trainedToday ? ' is-done' : ''}`} onClick={onToggle}>
          {trainedToday ? 'Тренировка была' : 'Отметить'}
        </button>
        <Link className="more-button" to="/extra/training">
          календарь
        </Link>
        <button className="more-button" onClick={onCopy}>
          <ClipboardCopy size={14} /> {copyFailed ? 'не получилось' : copied ? 'скопировано' : 'копировать'}
        </button>
      </div>
    </div>
  </section>
)

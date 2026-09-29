import { Award, Flame, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import type { TrainerItem, TrainerStats } from './trainerTypes'

type TrainerSummaryProps = {
  stats: TrainerStats
  items: TrainerItem[]
  onRestart: (mistakesOnly?: boolean) => void
  onExit: () => void
  onSpeak: (item: TrainerItem, rate: number) => void
}

export const TrainerSummary = ({ stats, items, onRestart, onExit, onSpeak }: TrainerSummaryProps) => {
  const { t } = useTranslation()
  const { totalAnswered, correctCount, incorrectCount, bestStreak, mistakeIds } = stats

  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

  const mistakeItems = items.filter((item) => mistakeIds.includes(item.id))

  const isFlawless = totalAnswered > 0 && incorrectCount === 0

  return (
    <div className="trainer-summary-container">
      <div className="trainer-summary-card">
        <div className="summary-trophy-badge">
          {isFlawless ? <Award size={52} className="flawless-icon" /> : <Sparkles size={52} className="summary-icon" />}
        </div>

        <h2 className="summary-title">{isFlawless ? t('lang.summary.flawless') : t('lang.summary.done')}</h2>

        <p className="summary-subtitle">{isFlawless ? t('lang.summary.flawlessNote') : t('lang.summary.note')}</p>

        <div className="summary-stats-grid">
          <div className="summary-stat-cell">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">{t('lang.summary.accuracy')}</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-value">
              {correctCount} / {totalAnswered}
            </span>
            <span className="stat-label">{t('lang.summary.correct')}</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-value stat-value--streak">
              <Flame size={20} />
              {bestStreak}
            </span>
            <span className="stat-label">{t('lang.summary.streak')}</span>
          </div>
        </div>

        {mistakeItems.length > 0 && (
          <div className="summary-mistakes-section">
            <div className="summary-mistakes-header">
              <span className="mistakes-count-badge">{t('lang.summary.mistakesBadge', undefined, { count: mistakeItems.length })}</span>
              <h4>{t('lang.summary.mistakesTitle')}</h4>
            </div>

            <div className="summary-mistakes-list">
              {mistakeItems.map((item) => (
                <div key={item.id} className="summary-mistake-row">
                  <div className="mistake-term-col">
                    <button type="button" className="mistake-audio-btn" onClick={() => onSpeak(item, 0.85)} title={t('lang.speak.aria')}>
                      <Volume2 size={16} />
                    </button>
                    <div>
                      <strong className="mistake-term">{item.term}</strong>
                      {item.transcription && <span className="mistake-transcr">{item.transcription}</span>}
                    </div>
                  </div>

                  <div className="mistake-trans-col">
                    <span className="mistake-trans">{item.translation}</span>
                    {item.example && <small className="mistake-ex">“{item.example}”</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="summary-actions-row">
          {mistakeItems.length > 0 && (
            <button type="button" className="trainer-btn trainer-btn--mistake-review" onClick={() => onRestart(true)}>
              <RotateCcw size={18} />
              <span>{t('lang.summary.retryMistakes', undefined, { count: mistakeItems.length })}</span>
            </button>
          )}

          <button type="button" className="trainer-btn trainer-btn--mastered" onClick={() => onRestart(false)}>
            <RotateCcw size={18} />
            <span>{t('lang.summary.restartAll')}</span>
          </button>

          <button type="button" className="trainer-btn trainer-btn--secondary" onClick={onExit}>
            <span>{t('lang.summary.backToDict')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

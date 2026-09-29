import { Award, Flame, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import type { TrainerItem, TrainerStats } from './trainerTypes'

type TrainerSummaryProps = {
  stats: TrainerStats
  items: TrainerItem[]
  onRestart: (mistakesOnly?: boolean) => void
  onExit: () => void
  onSpeak: (item: TrainerItem, rate: number) => void
}

export const TrainerSummary = ({ stats, items, onRestart, onExit, onSpeak }: TrainerSummaryProps) => {
  const { totalAnswered, correctCount, incorrectCount, bestStreak, mistakeIds } = stats

  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

  const mistakeItems = items.filter((item) => mistakeIds.includes(item.id))

  const isFlawless = totalAnswered > 0 && incorrectCount === 0

  return (
    <div className="trainer-summary-container">
      <div className="trainer-summary-card">
        {/* Celebration Header */}
        <div className="summary-trophy-badge">
          {isFlawless ? <Award size={52} className="flawless-icon" /> : <Sparkles size={52} className="summary-icon" />}
        </div>

        <h2 className="summary-title">{isFlawless ? 'Безупречный результат! 🎯' : 'Сессия тренировки завершена! 🎉'}</h2>

        <p className="summary-subtitle">
          {isFlawless
            ? 'Вы ответили на все карточки без единой ошибки. Потрясающая память!'
            : 'Отличная работа! Регулярные повторения закрепляют слова в долговременной памяти.'}
        </p>

        {/* Stats Grid */}
        <div className="summary-stats-grid">
          <div className="summary-stat-cell">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Точность</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-value">
              {correctCount} / {totalAnswered}
            </span>
            <span className="stat-label">Правильно</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-value stat-value--streak">
              <Flame size={20} />
              {bestStreak}
            </span>
            <span className="stat-label">Лучший стрик</span>
          </div>
        </div>

        {/* Mistakes Review List */}
        {mistakeItems.length > 0 && (
          <div className="summary-mistakes-section">
            <div className="summary-mistakes-header">
              <span className="mistakes-count-badge">Ошибки: {mistakeItems.length}</span>
              <h4>Слова, вызвавшие затруднения:</h4>
            </div>

            <div className="summary-mistakes-list">
              {mistakeItems.map((item) => (
                <div key={item.id} className="summary-mistake-row">
                  <div className="mistake-term-col">
                    <button type="button" className="mistake-audio-btn" onClick={() => onSpeak(item, 0.85)} title="Озвучить">
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

        {/* Action Buttons */}
        <div className="summary-actions-row">
          {mistakeItems.length > 0 && (
            <button type="button" className="trainer-btn trainer-btn--mistake-review" onClick={() => onRestart(true)}>
              <RotateCcw size={18} />
              <span>Повторить только ошибки ({mistakeItems.length})</span>
            </button>
          )}

          <button type="button" className="trainer-btn trainer-btn--mastered" onClick={() => onRestart(false)}>
            <RotateCcw size={18} />
            <span>Начать заново всю сессию</span>
          </button>

          <button type="button" className="trainer-btn trainer-btn--secondary" onClick={onExit}>
            <span>Вернуться к словарю</span>
          </button>
        </div>
      </div>
    </div>
  )
}

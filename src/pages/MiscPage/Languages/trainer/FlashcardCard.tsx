import { useEffect } from 'react'
import { Check, Eye, EyeOff, Volume2, X } from 'lucide-react'
import type { TrainerItem } from './trainerTypes'

type FlashcardCardProps = {
  item: TrainerItem
  isRevealed: boolean
  onToggleReveal: () => void
  onAnswer: (known: boolean) => void
  effectiveDirection: 'direct' | 'reverse'
  onSpeak: (item: TrainerItem, rate: number) => void
  audioRate: number
  playingId: string | null
}

export const FlashcardCard = ({
  item,
  isRevealed,
  onToggleReveal,
  onAnswer,
  effectiveDirection,
  onSpeak,
  audioRate,
  playingId,
}: FlashcardCardProps) => {
  const isDirect = effectiveDirection === 'direct'
  const promptText = isDirect ? item.term : item.translation
  const answerText = isDirect ? item.translation : item.term
  const isPlaying = playingId === item.id

  // Keyboard controls for speed & power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault()
        onToggleReveal()
      } else if (e.key === '1' || e.code === 'ArrowLeft') {
        if (isRevealed) {
          e.preventDefault()
          onAnswer(false)
        }
      } else if (e.key === '2' || e.code === 'ArrowRight') {
        if (isRevealed) {
          e.preventDefault()
          onAnswer(true)
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        onSpeak(item, audioRate)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRevealed, onToggleReveal, onAnswer, onSpeak, item, audioRate])

  return (
    <div className={`trainer-card-container ${isRevealed ? 'is-revealed' : ''}`}>
      <div className="trainer-flashcard">
        {/* Top Card Meta */}
        <div className="trainer-card-top">
          <div className="trainer-badges-row">
            {item.badge && <span className="trainer-badge">{item.badge}</span>}
            <span className="trainer-dir-badge">{isDirect ? 'Слово ➔ Перевод' : 'Перевод ➔ Слово'}</span>
          </div>

          <div className="trainer-card-audio-group">
            <button
              type="button"
              className={`trainer-speak-btn ${isPlaying ? 'playing' : ''}`}
              title="Прослушать произношение (R)"
              aria-label="Прослушать"
              onClick={() => onSpeak(item, audioRate)}
            >
              <Volume2 size={18} />
              <span>{isPlaying ? 'Играет...' : audioRate === 0.8 ? '0.8x' : 'Озвучить'}</span>
            </button>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="trainer-prompt-section">
          <h2 className="trainer-prompt-word">{promptText}</h2>

          {isDirect && item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
        </div>

        {/* Reveal Toggle Banner */}
        <button
          type="button"
          className="trainer-reveal-btn"
          onClick={onToggleReveal}
          aria-expanded={isRevealed}
          aria-label={isRevealed ? 'Скрыть перевод' : 'Показать перевод (Пробел)'}
        >
          {isRevealed ? (
            <>
              <EyeOff size={16} />
              <span>Скрыть подсказки</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span>Показать перевод и пример (Пробел)</span>
            </>
          )}
        </button>

        {/* Back / Revealed Details */}
        {isRevealed && (
          <div className="trainer-card-details">
            <div className="trainer-answer-highlight">
              <span className="trainer-answer-label">Перевод:</span>
              <h3 className="trainer-answer-text">{answerText}</h3>
              {!isDirect && item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
            </div>

            {item.meaning && (
              <div className="trainer-detail-block">
                <span className="trainer-detail-title">Нюанс и значение:</span>
                <p className="trainer-detail-desc">{item.meaning}</p>
              </div>
            )}

            {item.example && (
              <div className="trainer-example-card">
                <div className="trainer-example-orig">
                  <span className="trainer-quote-mark">“</span>
                  <span>{item.example}</span>
                </div>
                {item.exampleRu && <div className="trainer-example-ru">{item.exampleRu}</div>}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="trainer-action-footer">
          {isRevealed ? (
            <div className="trainer-eval-buttons">
              <button
                type="button"
                className="trainer-btn trainer-btn--mistake"
                onClick={() => onAnswer(false)}
                title="Горячая клавиша: 1 или Стрелка влево"
              >
                <X size={18} />
                <span>Не помню (1)</span>
              </button>

              <button
                type="button"
                className="trainer-btn trainer-btn--mastered"
                onClick={() => onAnswer(true)}
                title="Горячая клавиша: 2 или Стрелка вправо"
              >
                <Check size={18} />
                <span>Знаю (2)</span>
              </button>
            </div>
          ) : (
            <div className="trainer-reveal-hint">
              <span>Нажмите карточку или «Пробел», чтобы проверить себя</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

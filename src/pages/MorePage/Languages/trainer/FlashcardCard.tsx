import { useEffect } from 'react'
import { Check, Eye, EyeOff, Volume2, X } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
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
  const { t } = useTranslation()
  const isDirect = effectiveDirection === 'direct'
  const promptText = isDirect ? item.term : item.translation
  const answerText = isDirect ? item.translation : item.term
  const isPlaying = playingId === item.id

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        <div className="trainer-card-top">
          <div className="trainer-badges-row">
            {item.badge && <span className="trainer-badge">{item.badge}</span>}
            <span className="trainer-dir-badge">{isDirect ? t('lang.card.dirDirect') : t('lang.card.dirReverse')}</span>
          </div>

          <div className="trainer-card-audio-group">
            <button
              type="button"
              className={`trainer-speak-btn ${isPlaying ? 'playing' : ''}`}
              title={t('lang.card.listenTitle')}
              aria-label={t('lang.card.listenAria')}
              onClick={() => onSpeak(item, audioRate)}
            >
              <Volume2 size={18} />
              <span>{isPlaying ? t('lang.card.playing') : audioRate === 0.8 ? '0.8x' : t('lang.card.speak')}</span>
            </button>
          </div>
        </div>

        <div className="trainer-prompt-section">
          <h2 className="trainer-prompt-word">{promptText}</h2>

          {isDirect && item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
        </div>

        <button
          type="button"
          className="trainer-reveal-btn"
          onClick={onToggleReveal}
          aria-expanded={isRevealed}
          aria-label={isRevealed ? t('lang.card.hideAria') : t('lang.card.showAria')}
        >
          {isRevealed ? (
            <>
              <EyeOff size={16} />
              <span>{t('lang.card.hide')}</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span>{t('lang.card.show')}</span>
            </>
          )}
        </button>

        {isRevealed && (
          <div className="trainer-card-details">
            <div className="trainer-answer-highlight">
              <span className="trainer-answer-label">{t('lang.card.translation')}</span>
              <h3 className="trainer-answer-text">{answerText}</h3>
              {!isDirect && item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
            </div>

            {item.meaning && (
              <div className="trainer-detail-block">
                <span className="trainer-detail-title">{t('lang.card.meaning')}</span>
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

        <div className="trainer-action-footer">
          {isRevealed ? (
            <div className="trainer-eval-buttons">
              <button
                type="button"
                className="trainer-btn trainer-btn--mistake"
                onClick={() => onAnswer(false)}
                title={t('lang.card.noTitle')}
              >
                <X size={18} />
                <span>{t('lang.card.no')}</span>
              </button>

              <button
                type="button"
                className="trainer-btn trainer-btn--mastered"
                onClick={() => onAnswer(true)}
                title={t('lang.card.yesTitle')}
              >
                <Check size={18} />
                <span>{t('lang.card.yes')}</span>
              </button>
            </div>
          ) : (
            <div className="trainer-reveal-hint">
              <span>{t('lang.card.hint')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

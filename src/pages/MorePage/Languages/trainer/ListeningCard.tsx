import { useEffect, useRef } from 'react'
import { ArrowRight, Check, Headphones, Sparkles, Volume2, X } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import type { QuizOption, TrainerItem } from './trainerTypes'

type ListeningCardProps = {
  item: TrainerItem
  options: QuizOption[]
  selectedOption: number | null
  isAnswerChecked: boolean
  onSelectOption: (index: number) => void
  onAdvance: () => void
  onSpeak: (item: TrainerItem, rate: number) => void
  audioRate: number
  playingId: string | null
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export const ListeningCard = ({
  item,
  options,
  selectedOption,
  isAnswerChecked,
  onSelectOption,
  onAdvance,
  onSpeak,
  audioRate,
  playingId,
}: ListeningCardProps) => {
  const { t } = useTranslation()
  const isPlaying = playingId === item.id

  const speakRef = useRef({ onSpeak, audioRate })
  useEffect(() => {
    speakRef.current = { onSpeak, audioRate }
  })

  useEffect(() => {
    speakRef.current.onSpeak(item, speakRef.current.audioRate)
  }, [item])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (!isAnswerChecked) {
        if (e.key === '1' && options[0]) onSelectOption(0)
        else if (e.key === '2' && options[1]) onSelectOption(1)
        else if (e.key === '3' && options[2]) onSelectOption(2)
        else if (e.key === '4' && options[3]) onSelectOption(3)
      } else {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault()
          onAdvance()
        }
      }

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        onSpeak(item, audioRate)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnswerChecked, options, onSelectOption, onAdvance, onSpeak, item, audioRate])

  return (
    <div className="trainer-listening-card">
      <div className="trainer-card-top">
        <div className="trainer-badges-row">
          <span className="trainer-mode-chip">
            <Headphones size={15} /> {t('lang.listen.mode')}
          </span>
          {item.badge && <span className="trainer-badge">{item.badge}</span>}
        </div>
      </div>

      <div className="trainer-listening-hero">
        <div className={`listening-sound-ring ${isPlaying ? 'is-pulsing' : ''}`}>
          <button
            type="button"
            className="listening-big-play-btn"
            onClick={() => onSpeak(item, audioRate)}
            title={t('lang.listen.againTitle')}
            aria-label={t('lang.listen.aria')}
          >
            <Volume2 size={36} />
          </button>
        </div>

        <div className="listening-prompt-label">
          {isPlaying ? <span className="listening-wave-text">{t('lang.listen.waiting')}</span> : <span>{t('lang.listen.hint')}</span>}
        </div>

        <div className="listening-audio-controls">
          <button type="button" className={`speed-pill ${audioRate === 1.0 ? 'active' : ''}`} onClick={() => onSpeak(item, 1.0)}>
            {t('lang.listen.speedNormal')}
          </button>
          <button type="button" className={`speed-pill ${audioRate === 0.8 ? 'active' : ''}`} onClick={() => onSpeak(item, 0.8)}>
            {t('lang.listen.speedSlow')}
          </button>
        </div>

        {isAnswerChecked && (
          <div className="listening-revealed-term">
            <h2 className="revealed-word">{item.term}</h2>
            {item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
          </div>
        )}
      </div>

      <div className="listening-question-title">{t('lang.listen.question')}</div>

      <div className="trainer-quiz-options" role="radiogroup">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === idx
          let stateClass = ''

          if (isAnswerChecked) {
            if (opt.isCorrect) {
              stateClass = 'option-correct'
            } else if (isSelected && !opt.isCorrect) {
              stateClass = 'option-wrong'
            } else {
              stateClass = 'option-disabled'
            }
          }

          return (
            <button
              key={`${opt.originalItem.id}-${idx}`}
              type="button"
              className={`trainer-quiz-option ${stateClass} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectOption(idx)}
              disabled={isAnswerChecked}
            >
              <span className="option-label-badge">{OPTION_LABELS[idx]}</span>
              <span className="option-text">{opt.originalItem.translation}</span>
              {isAnswerChecked && opt.isCorrect && <Check size={18} className="option-icon-correct" />}
              {isAnswerChecked && isSelected && !opt.isCorrect && <X size={18} className="option-icon-wrong" />}
            </button>
          )
        })}
      </div>

      {isAnswerChecked && (
        <div className="trainer-quiz-feedback">
          <div className="trainer-feedback-header">
            {selectedOption !== null && options[selectedOption]?.isCorrect ? (
              <div className="feedback-status status--correct">
                <Check size={20} />
                <strong>{t('lang.listen.correct')}</strong>
              </div>
            ) : (
              <div className="feedback-status status--wrong">
                <X size={20} />
                <div>
                  <strong>{t('lang.listen.wrong')}</strong>
                  <p>
                    {t('lang.listen.wasLabel')} <u>{item.term}</u> ({item.translation})
                  </p>
                </div>
              </div>
            )}

            <button type="button" className="trainer-btn trainer-btn--next" onClick={onAdvance} autoFocus>
              <span>{t('lang.listen.next')}</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {(item.meaning || item.example) && (
            <div className="trainer-feedback-body">
              {item.meaning && (
                <div className="feedback-info-line">
                  <Sparkles size={15} />
                  <span>{item.meaning}</span>
                </div>
              )}
              {item.example && (
                <div className="feedback-example-line">
                  <span className="example-orig">“{item.example}”</span>
                  {item.exampleRu && <span className="example-trans"> — {item.exampleRu}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { ArrowRight, Check, Sparkles, Volume2, X } from 'lucide-react'
import type { QuizOption, TrainerItem } from './trainerTypes'

type QuizCardProps = {
  item: TrainerItem
  options: QuizOption[]
  selectedOption: number | null
  isAnswerChecked: boolean
  onSelectOption: (index: number) => void
  onAdvance: () => void
  effectiveDirection: 'direct' | 'reverse'
  onSpeak: (item: TrainerItem, rate: number) => void
  audioRate: number
  playingId: string | null
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export const QuizCard = ({
  item,
  options,
  selectedOption,
  isAnswerChecked,
  onSelectOption,
  onAdvance,
  effectiveDirection,
  onSpeak,
  audioRate,
  playingId,
}: QuizCardProps) => {
  const isDirect = effectiveDirection === 'direct'
  const promptText = isDirect ? item.term : item.translation
  const isPlaying = playingId === item.id

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
    <div className="trainer-quiz-card">
      {/* Top Question Header */}
      <div className="trainer-card-top">
        <div className="trainer-badges-row">
          <span className="trainer-mode-chip">🎯 Выбери правильный ответ</span>
          {item.badge && <span className="trainer-badge">{item.badge}</span>}
        </div>

        <button
          type="button"
          className={`trainer-speak-btn ${isPlaying ? 'playing' : ''}`}
          onClick={() => onSpeak(item, audioRate)}
          title="Прослушать (R)"
          aria-label="Прослушать"
        >
          <Volume2 size={18} />
          <span>{isPlaying ? 'Играет...' : 'Озвучить'}</span>
        </button>
      </div>

      {/* Main Prompt Word */}
      <div className="trainer-quiz-prompt">
        <span className="trainer-quiz-subtitle">{isDirect ? 'Как переводится это слово?' : 'Как это звучит на изучаемом языке?'}</span>
        <h2 className="trainer-prompt-word">{promptText}</h2>
        {isDirect && item.transcription && <div className="trainer-transcription">{item.transcription}</div>}
      </div>

      {/* 4 Choices Grid */}
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
              aria-label={`Вариант ${OPTION_LABELS[idx]}: ${opt.text}`}
            >
              <span className="option-label-badge">{OPTION_LABELS[idx]}</span>
              <span className="option-text">{opt.text}</span>
              {isAnswerChecked && opt.isCorrect && <Check size={18} className="option-icon-correct" />}
              {isAnswerChecked && isSelected && !opt.isCorrect && <X size={18} className="option-icon-wrong" />}
            </button>
          )
        })}
      </div>

      {/* Feedback & Explanation Card */}
      {isAnswerChecked && (
        <div className="trainer-quiz-feedback">
          <div className="trainer-feedback-header">
            {selectedOption !== null && options[selectedOption]?.isCorrect ? (
              <div className="feedback-status status--correct">
                <Check size={20} />
                <strong>Отлично! Абсолютно верно!</strong>
              </div>
            ) : (
              <div className="feedback-status status--wrong">
                <X size={20} />
                <div>
                  <strong>Не совсем так</strong>
                  <p>
                    Правильный ответ: <u>{isDirect ? item.translation : item.term}</u>
                  </p>
                </div>
              </div>
            )}

            <button type="button" className="trainer-btn trainer-btn--next" onClick={onAdvance} autoFocus>
              <span>Следующий вопрос (Enter)</span>
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

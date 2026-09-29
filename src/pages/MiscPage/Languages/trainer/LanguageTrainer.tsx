import { useEffect } from 'react'
import {
  ArrowLeftRight,
  Check,
  Flame,
  Gauge,
  Headphones,
  HelpCircle,
  Layers,
  ListFilter,
  RotateCcw,
  Shuffle,
  Volume2,
  Zap,
} from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import { FlashcardCard } from './FlashcardCard'
import { ListeningCard } from './ListeningCard'
import { QuizCard } from './QuizCard'
import { SprintGame } from './SprintGame'
import { TrainerSummary } from './TrainerSummary'
import type { TrainerItem } from './trainerTypes'
import { useTrainerSession } from './useTrainerSession'
import './LanguageTrainer.css'

export type LanguageTrainerProps = {
  items: TrainerItem[]
  categories: { id: string; label: string; icon?: string }[]
  storageKeyPrefix: string
  title: string
  onSpeak: (item: TrainerItem, rate: number) => void
  playingId: string | null
  onExit?: () => void
}

export const LanguageTrainer = ({ items, categories, storageKeyPrefix, title, onSpeak, playingId, onExit }: LanguageTrainerProps) => {
  const { t } = useTranslation()
  const session = useTrainerSession({ items, storageKeyPrefix })

  const {
    mode,
    setMode,
    direction,
    setDirection,
    effectiveDirection,
    categoryFilter,
    setCategoryFilter,
    onlyUnlearned,
    setOnlyUnlearned,
    onlyMistakes,
    setOnlyMistakes,
    isShuffle,
    setIsShuffle,
    audioRate,
    setAudioRate,
    autoPlay,
    setAutoPlay,
    learnedIds,
    queue,
    currentIndex,
    currentItem,
    isRevealed,
    setIsRevealed,
    quizOptions,
    selectedOption,
    isAnswerChecked,
    handleOptionSelect,
    handleFlashcardAnswer,
    advanceNext,
    restartSession,
    stats,
    isSessionFinished,
  } = session

  useEffect(() => {
    if (autoPlay && currentItem && (mode === 'flashcard' || mode === 'quiz')) {
      onSpeak(currentItem, audioRate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id, autoPlay, mode])

  const progressPct = queue.length > 0 ? Math.round(((currentIndex + 1) / queue.length) * 100) : 0

  return (
    <div className="language-trainer-root" aria-label={title}>
      <div className="trainer-modes-nav" role="tablist" aria-label={t('lang.trainer.aria')}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'flashcard'}
          className={`trainer-mode-btn ${mode === 'flashcard' ? 'active' : ''}`}
          onClick={() => setMode('flashcard')}
        >
          <Layers size={17} />
          <span>{t('lang.trainer.flashcards')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'quiz'}
          className={`trainer-mode-btn ${mode === 'quiz' ? 'active' : ''}`}
          onClick={() => setMode('quiz')}
        >
          <HelpCircle size={17} />
          <span>{t('lang.trainer.quiz')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'listening'}
          className={`trainer-mode-btn ${mode === 'listening' ? 'active' : ''}`}
          onClick={() => setMode('listening')}
        >
          <Headphones size={17} />
          <span>{t('lang.trainer.listening')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sprint'}
          className={`trainer-mode-btn trainer-mode-btn--sprint ${mode === 'sprint' ? 'active' : ''}`}
          onClick={() => setMode('sprint')}
        >
          <Zap size={17} />
          <span>{t('lang.trainer.sprint')}</span>
        </button>
      </div>

      {mode !== 'sprint' && (
        <div className="trainer-controls-panel">
          <div className="trainer-controls-row">
            <div className="trainer-control-group">
              <label htmlFor="trainer-cat-select" className="trainer-control-label">
                <ListFilter size={14} /> {t('lang.trainer.topic')}
              </label>
              <select
                id="trainer-cat-select"
                className="trainer-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">{t('lang.trainer.topicAll', undefined, { count: items.length })}</option>
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({items.filter((i) => i.category === c.id).length})
                    </option>
                  ))}
              </select>
            </div>

            <div className="trainer-control-group">
              <span className="trainer-control-label">
                <ArrowLeftRight size={14} /> {t('lang.trainer.direction')}
              </span>
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'direct' ? 'active' : ''}`}
                  onClick={() => setDirection('direct')}
                  title={t('lang.trainer.directionDirectTitle')}
                >
                  {t('lang.trainer.directionDirect')}
                </button>
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'reverse' ? 'active' : ''}`}
                  onClick={() => setDirection('reverse')}
                  title={t('lang.trainer.directionReverseTitle')}
                >
                  {t('lang.trainer.directionReverse')}
                </button>
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'mixed' ? 'active' : ''}`}
                  onClick={() => setDirection('mixed')}
                  title={t('lang.trainer.directionMixedTitle')}
                >
                  {t('lang.trainer.directionMixed')}
                </button>
              </div>
            </div>

            <div className="trainer-control-group">
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${onlyUnlearned ? 'active' : ''}`}
                  onClick={() => {
                    setOnlyUnlearned((v) => !v)
                    setOnlyMistakes(false)
                  }}
                  title={t('lang.trainer.onlyUnlearnedTitle')}
                >
                  {t('lang.trainer.onlyUnlearned')}
                </button>

                {stats.mistakeIds.length > 0 && (
                  <button
                    type="button"
                    className={`trainer-pill trainer-pill--danger ${onlyMistakes ? 'active' : ''}`}
                    onClick={() => {
                      setOnlyMistakes((v) => !v)
                      setOnlyUnlearned(false)
                    }}
                  >
                    {t('lang.trainer.mistakes', undefined, { count: stats.mistakeIds.length })}
                  </button>
                )}

                <button
                  type="button"
                  className={`trainer-pill ${isShuffle ? 'active' : ''}`}
                  onClick={() => setIsShuffle((v) => !v)}
                  title={t('lang.trainer.shuffleTitle')}
                >
                  <Shuffle size={14} /> {t('lang.trainer.shuffle')}
                </button>
              </div>
            </div>

            <div className="trainer-control-group">
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${audioRate === 0.8 ? 'active' : ''}`}
                  onClick={() => setAudioRate((r) => (r === 1.0 ? 0.8 : 1.0))}
                  title={t('lang.trainer.speed')}
                >
                  <Gauge size={14} /> {audioRate === 0.8 ? t('lang.trainer.speedSlow') : t('lang.trainer.speedNormal')}
                </button>

                <button
                  type="button"
                  className={`trainer-pill ${autoPlay ? 'active' : ''}`}
                  onClick={() => setAutoPlay((v) => !v)}
                  title={t('lang.trainer.autoTitle')}
                >
                  <Volume2 size={14} /> {autoPlay ? t('lang.trainer.autoOn') : t('lang.trainer.autoOff')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode !== 'sprint' && !isSessionFinished && (
        <div className="trainer-progress-header">
          <div className="trainer-progress-left">
            <span className="trainer-step-indicator">
              {t('lang.trainer.card', undefined, { current: currentIndex + 1, total: queue.length })}
            </span>
            <div className="trainer-progress-track">
              <div className="trainer-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="trainer-progress-right">
            {stats.currentStreak >= 2 && (
              <div className="trainer-streak-badge" title={t('lang.trainer.streakTitle')}>
                <Flame size={17} className="flame-glow" />
                <span>{t('lang.trainer.streak', undefined, { count: stats.currentStreak })}</span>
              </div>
            )}

            <div className="trainer-mastered-counter" title={t('lang.trainer.learnedTitle')}>
              <Check size={15} />
              <span>{t('lang.trainer.learned', undefined, { count: learnedIds.length })}</span>
            </div>

            <button
              type="button"
              className="trainer-restart-mini-btn"
              onClick={() => restartSession(false)}
              title={t('lang.trainer.restartTitle')}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="trainer-viewport">
        {isSessionFinished ? (
          <TrainerSummary
            stats={stats}
            items={items}
            onRestart={restartSession}
            onExit={onExit ?? (() => restartSession(false))}
            onSpeak={onSpeak}
          />
        ) : mode === 'sprint' ? (
          <SprintGame items={items} storageKeyPrefix={storageKeyPrefix} onSpeak={onSpeak} onExit={() => setMode('flashcard')} />
        ) : !currentItem ? (
          <div className="trainer-empty-state">
            <p>{t('lang.trainer.empty')}</p>
            <button
              type="button"
              className="trainer-btn trainer-btn--mastered"
              onClick={() => {
                setCategoryFilter('all')
                setOnlyUnlearned(false)
                setOnlyMistakes(false)
              }}
            >
              {t('lang.trainer.resetFilters')}
            </button>
          </div>
        ) : mode === 'flashcard' ? (
          <FlashcardCard
            item={currentItem}
            isRevealed={isRevealed}
            onToggleReveal={() => setIsRevealed((v) => !v)}
            onAnswer={handleFlashcardAnswer}
            effectiveDirection={effectiveDirection}
            onSpeak={onSpeak}
            audioRate={audioRate}
            playingId={playingId}
          />
        ) : mode === 'quiz' ? (
          <QuizCard
            item={currentItem}
            options={quizOptions}
            selectedOption={selectedOption}
            isAnswerChecked={isAnswerChecked}
            onSelectOption={handleOptionSelect}
            onAdvance={advanceNext}
            effectiveDirection={effectiveDirection}
            onSpeak={onSpeak}
            audioRate={audioRate}
            playingId={playingId}
          />
        ) : (
          <ListeningCard
            item={currentItem}
            options={quizOptions}
            selectedOption={selectedOption}
            isAnswerChecked={isAnswerChecked}
            onSelectOption={handleOptionSelect}
            onAdvance={advanceNext}
            onSpeak={onSpeak}
            audioRate={audioRate}
            playingId={playingId}
          />
        )}
      </div>

      {mode === 'flashcard' && !isSessionFinished && (
        <div className="trainer-keyboard-hints" aria-hidden="true">
          <span>{t('lang.trainer.keys')}</span>
          <kbd>{t('lang.trainer.keySpace')}</kbd> — {t('lang.trainer.actionFlip')} • <kbd>1</kbd> / <kbd>←</kbd> — {t('lang.trainer.keyNo')}{' '}
          • <kbd>2</kbd> / <kbd>→</kbd> — {t('lang.trainer.keyYes')} • <kbd>R</kbd> — {t('lang.trainer.keySpeak')}
        </div>
      )}
    </div>
  )
}

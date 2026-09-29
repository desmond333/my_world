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

  // Auto-play audio when card changes if autoPlay is enabled
  useEffect(() => {
    if (autoPlay && currentItem && (mode === 'flashcard' || mode === 'quiz')) {
      onSpeak(currentItem, audioRate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id, autoPlay, mode])

  const progressPct = queue.length > 0 ? Math.round(((currentIndex + 1) / queue.length) * 100) : 0

  return (
    <div className="language-trainer-root" aria-label={title}>
      {/* Top Trainer Mode Navigation */}
      <div className="trainer-modes-nav" role="tablist" aria-label="Режимы тренировки">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'flashcard'}
          className={`trainer-mode-btn ${mode === 'flashcard' ? 'active' : ''}`}
          onClick={() => setMode('flashcard')}
        >
          <Layers size={17} />
          <span>🗂️ Карточки</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'quiz'}
          className={`trainer-mode-btn ${mode === 'quiz' ? 'active' : ''}`}
          onClick={() => setMode('quiz')}
        >
          <HelpCircle size={17} />
          <span>🎯 4-Квиз</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'listening'}
          className={`trainer-mode-btn ${mode === 'listening' ? 'active' : ''}`}
          onClick={() => setMode('listening')}
        >
          <Headphones size={17} />
          <span>🎧 Аудирование</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sprint'}
          className={`trainer-mode-btn trainer-mode-btn--sprint ${mode === 'sprint' ? 'active' : ''}`}
          onClick={() => setMode('sprint')}
        >
          <Zap size={17} />
          <span>⚡ Спринт (45с)</span>
        </button>
      </div>

      {/* Control & Settings Toolbar */}
      {mode !== 'sprint' && (
        <div className="trainer-controls-panel">
          <div className="trainer-controls-row">
            {/* Category Select */}
            <div className="trainer-control-group">
              <label htmlFor="trainer-cat-select" className="trainer-control-label">
                <ListFilter size={14} /> Тема:
              </label>
              <select
                id="trainer-cat-select"
                className="trainer-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Все темы ({items.length})</option>
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({items.filter((i) => i.category === c.id).length})
                    </option>
                  ))}
              </select>
            </div>

            {/* Direction Toggle */}
            <div className="trainer-control-group">
              <span className="trainer-control-label">
                <ArrowLeftRight size={14} /> Направление:
              </span>
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'direct' ? 'active' : ''}`}
                  onClick={() => setDirection('direct')}
                  title="С изучаемого языка на русский"
                >
                  Слово ➔ RU
                </button>
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'reverse' ? 'active' : ''}`}
                  onClick={() => setDirection('reverse')}
                  title="С русского на изучаемый язык"
                >
                  RU ➔ Слово
                </button>
                <button
                  type="button"
                  className={`trainer-pill ${direction === 'mixed' ? 'active' : ''}`}
                  onClick={() => setDirection('mixed')}
                  title="Случайная смена направления"
                >
                  Микс 🔀
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="trainer-control-group">
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${onlyUnlearned ? 'active' : ''}`}
                  onClick={() => {
                    setOnlyUnlearned((v) => !v)
                    setOnlyMistakes(false)
                  }}
                  title="Только слова, которые ещё не выучены"
                >
                  Только невыученные
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
                    Ошибки ({stats.mistakeIds.length})
                  </button>
                )}

                <button
                  type="button"
                  className={`trainer-pill ${isShuffle ? 'active' : ''}`}
                  onClick={() => setIsShuffle((v) => !v)}
                  title="Перемешать порядок карточек"
                >
                  <Shuffle size={14} /> Перемешать
                </button>
              </div>
            </div>

            {/* Audio Options */}
            <div className="trainer-control-group">
              <div className="trainer-pill-group">
                <button
                  type="button"
                  className={`trainer-pill ${audioRate === 0.8 ? 'active' : ''}`}
                  onClick={() => setAudioRate((r) => (r === 1.0 ? 0.8 : 1.0))}
                  title="Скорость воспроизведения"
                >
                  <Gauge size={14} /> {audioRate === 0.8 ? '0.8x (Медленно)' : '1.0x (Норма)'}
                </button>

                <button
                  type="button"
                  className={`trainer-pill ${autoPlay ? 'active' : ''}`}
                  onClick={() => setAutoPlay((v) => !v)}
                  title="Автоматически произносить при смене карточки"
                >
                  <Volume2 size={14} /> {autoPlay ? 'Автоозвучка: Вкл' : 'Автоозвучка: Выкл'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Live Streak Bar */}
      {mode !== 'sprint' && !isSessionFinished && (
        <div className="trainer-progress-header">
          <div className="trainer-progress-left">
            <span className="trainer-step-indicator">
              Карточка <strong>{currentIndex + 1}</strong> из {queue.length}
            </span>
            <div className="trainer-progress-track">
              <div className="trainer-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="trainer-progress-right">
            {stats.currentStreak >= 2 && (
              <div className="trainer-streak-badge" title="Серия правильных ответов подряд">
                <Flame size={17} className="flame-glow" />
                <span>{stats.currentStreak} подряд!</span>
              </div>
            )}

            <div className="trainer-mastered-counter" title="Всего выучено слов в этом словаре">
              <Check size={15} />
              <span>{learnedIds.length} выучено</span>
            </div>

            <button type="button" className="trainer-restart-mini-btn" onClick={() => restartSession(false)} title="Начать сессию заново">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Active Workout View */}
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
            <p>Нет карточек по выбранным фильтрам.</p>
            <button
              type="button"
              className="trainer-btn trainer-btn--mastered"
              onClick={() => {
                setCategoryFilter('all')
                setOnlyUnlearned(false)
                setOnlyMistakes(false)
              }}
            >
              Сбросить фильтры
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

      {/* Keyboard Shortcuts Hint (Desktop) */}
      {mode === 'flashcard' && !isSessionFinished && (
        <div className="trainer-keyboard-hints" aria-hidden="true">
          <span>Подсказки клавиш:</span>
          <kbd>Пробел</kbd> — Перевернуть карточку • <kbd>1</kbd> или <kbd>←</kbd> — Не помню • <kbd>2</kbd> или <kbd>→</kbd> — Знаю •{' '}
          <kbd>R</kbd> — Озвучить
        </div>
      )}
    </div>
  )
}

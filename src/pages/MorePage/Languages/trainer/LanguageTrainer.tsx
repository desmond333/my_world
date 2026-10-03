import { useEffect, useRef } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../shared/ui'
import { FlashcardCard } from './FlashcardCard'
import { ListeningCard } from './ListeningCard'
import { QuizCard } from './QuizCard'
import { SprintGame } from './SprintGame'
import { TrainerSummary } from './TrainerSummary'
import type { TrainerDirection, TrainerItem, TrainerMode } from './trainerTypes'
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

  const speakRef = useRef({ onSpeak, audioRate })
  useEffect(() => {
    speakRef.current = { onSpeak, audioRate }
  })

  useEffect(() => {
    if (autoPlay && currentItem && (mode === 'flashcard' || mode === 'quiz')) {
      speakRef.current.onSpeak(currentItem, speakRef.current.audioRate)
    }
  }, [currentItem, autoPlay, mode])

  const progressPct = queue.length > 0 ? Math.round(((currentIndex + 1) / queue.length) * 100) : 0

  const filterValues: string[] = [
    ...(onlyUnlearned ? ['unlearned'] : []),
    ...(onlyMistakes ? ['mistakes'] : []),
    ...(isShuffle ? ['shuffle'] : []),
  ]

  const handleFilterChange = (values: string[]) => {
    const nextUnlearned = values.includes('unlearned')
    const nextMistakes = values.includes('mistakes')
    if (nextUnlearned && nextMistakes) {
      if (!onlyUnlearned) {
        setOnlyUnlearned(true)
        setOnlyMistakes(false)
      } else {
        setOnlyMistakes(true)
        setOnlyUnlearned(false)
      }
    } else {
      setOnlyUnlearned(nextUnlearned)
      setOnlyMistakes(nextMistakes)
    }
    setIsShuffle(values.includes('shuffle'))
  }

  const audioValues: string[] = [...(audioRate === 0.8 ? ['slow'] : []), ...(autoPlay ? ['auto'] : [])]

  const handleAudioChange = (values: string[]) => {
    setAudioRate(values.includes('slow') ? 0.8 : 1.0)
    setAutoPlay(values.includes('auto'))
  }

  return (
    <Tabs value={mode} onValueChange={(value) => setMode(value as TrainerMode)} className="language-trainer-root" aria-label={title}>
      <TabsList className="trainer-modes-nav" aria-label={t('lang.trainer.aria')}>
        <TabsTrigger className="trainer-mode-btn" value="flashcard">
          <Layers size={17} />
          <span>{t('lang.trainer.flashcards')}</span>
        </TabsTrigger>

        <TabsTrigger className="trainer-mode-btn" value="quiz">
          <HelpCircle size={17} />
          <span>{t('lang.trainer.quiz')}</span>
        </TabsTrigger>

        <TabsTrigger className="trainer-mode-btn" value="listening">
          <Headphones size={17} />
          <span>{t('lang.trainer.listening')}</span>
        </TabsTrigger>

        <TabsTrigger className="trainer-mode-btn trainer-mode-btn--sprint" value="sprint">
          <Zap size={17} />
          <span>{t('lang.trainer.sprint')}</span>
        </TabsTrigger>
      </TabsList>

      {mode !== 'sprint' && (
        <div className="trainer-controls-panel">
          <div className="trainer-controls-row">
            <div className="trainer-control-group">
              <label htmlFor="trainer-cat-select" className="trainer-control-label">
                <ListFilter size={14} /> {t('lang.trainer.topic')}
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="trainer-cat-select" className="trainer-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('lang.trainer.topicAll', undefined, { count: items.length })}</SelectItem>
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label} ({items.filter((i) => i.category === c.id).length})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="trainer-control-group">
              <span className="trainer-control-label">
                <ArrowLeftRight size={14} /> {t('lang.trainer.direction')}
              </span>
              <ToggleGroup
                type="single"
                value={direction}
                onValueChange={(value) => {
                  if (value) setDirection(value as TrainerDirection)
                }}
                className="trainer-pill-group"
              >
                <ToggleGroupItem value="direct" className="trainer-pill" title={t('lang.trainer.directionDirectTitle')}>
                  {t('lang.trainer.directionDirect')}
                </ToggleGroupItem>
                <ToggleGroupItem value="reverse" className="trainer-pill" title={t('lang.trainer.directionReverseTitle')}>
                  {t('lang.trainer.directionReverse')}
                </ToggleGroupItem>
                <ToggleGroupItem value="mixed" className="trainer-pill" title={t('lang.trainer.directionMixedTitle')}>
                  {t('lang.trainer.directionMixed')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="trainer-control-group">
              <ToggleGroup type="multiple" value={filterValues} onValueChange={handleFilterChange} className="trainer-pill-group">
                <ToggleGroupItem value="unlearned" className="trainer-pill" title={t('lang.trainer.onlyUnlearnedTitle')}>
                  {t('lang.trainer.onlyUnlearned')}
                </ToggleGroupItem>

                {stats.mistakeIds.length > 0 && (
                  <ToggleGroupItem value="mistakes" className="trainer-pill trainer-pill--danger">
                    {t('lang.trainer.mistakes', undefined, { count: stats.mistakeIds.length })}
                  </ToggleGroupItem>
                )}

                <ToggleGroupItem value="shuffle" className="trainer-pill" title={t('lang.trainer.shuffleTitle')}>
                  <Shuffle size={14} /> {t('lang.trainer.shuffle')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="trainer-control-group">
              <ToggleGroup type="multiple" value={audioValues} onValueChange={handleAudioChange} className="trainer-pill-group">
                <ToggleGroupItem value="slow" className="trainer-pill" title={t('lang.trainer.speed')}>
                  <Gauge size={14} /> {audioRate === 0.8 ? t('lang.trainer.speedSlow') : t('lang.trainer.speedNormal')}
                </ToggleGroupItem>

                <ToggleGroupItem value="auto" className="trainer-pill" title={t('lang.trainer.autoTitle')}>
                  <Volume2 size={14} /> {autoPlay ? t('lang.trainer.autoOn') : t('lang.trainer.autoOff')}
                </ToggleGroupItem>
              </ToggleGroup>
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

      <TabsContent value={mode} className="trainer-viewport">
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
      </TabsContent>

      {mode === 'flashcard' && !isSessionFinished && (
        <div className="trainer-keyboard-hints" aria-hidden="true">
          <span>{t('lang.trainer.keys')}</span>
          <kbd>{t('lang.trainer.keySpace')}</kbd> — {t('lang.trainer.actionFlip')} • <kbd>1</kbd> / <kbd>←</kbd> — {t('lang.trainer.keyNo')}{' '}
          • <kbd>2</kbd> / <kbd>→</kbd> — {t('lang.trainer.keyYes')} • <kbd>R</kbd> — {t('lang.trainer.keySpeak')}
        </div>
      )}
    </Tabs>
  )
}

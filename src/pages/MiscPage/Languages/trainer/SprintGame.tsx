import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Flame, Play, RotateCcw, Trophy, X, Zap } from 'lucide-react'
import { storage } from '../../../../lib'
import type { TrainerItem } from './trainerTypes'

type SprintGameProps = {
  items: TrainerItem[]
  storageKeyPrefix: string
  onSpeak: (item: TrainerItem, rate: number) => void
  onExit: () => void
}

const GAME_DURATION_SECONDS = 45

export const SprintGame = ({ items, storageKeyPrefix, onSpeak: _onSpeak, onExit }: SprintGameProps) => {
  const highscoreKey = `${storageKeyPrefix}-sprint-highscore`
  const [highScore, setHighScore] = useState<number>(() => storage.get<number>(highscoreKey, 0))

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle')
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [correctAttempts, setCorrectAttempts] = useState(0)

  // Current question: item + proposed translation + isMatch
  const [currentWord, setCurrentWord] = useState<TrainerItem | null>(null)
  const [suggestedTranslation, setSuggestedTranslation] = useState<string>('')
  const [isMatch, setIsMatch] = useState<boolean>(true)
  const [feedbackEffect, setFeedbackEffect] = useState<'correct' | 'wrong' | null>(null)

  const timerRef = useRef<number | null>(null)

  // Generate next pair
  const nextPair = useCallback(() => {
    if (items.length === 0) return
    const randomItem = items[Math.floor(Math.random() * items.length)]
    if (!randomItem) return

    // 50% chance match, 50% chance distractor
    const shouldMatch = Math.random() >= 0.5
    let trans = randomItem.translation

    if (!shouldMatch && items.length > 1) {
      const otherItems = items.filter((i) => i.id !== randomItem.id)
      const fake = otherItems[Math.floor(Math.random() * otherItems.length)]
      if (fake) {
        trans = fake.translation
      }
    }

    setCurrentWord(randomItem)
    setSuggestedTranslation(trans)
    setIsMatch(shouldMatch)
    setFeedbackEffect(null)
  }, [items])

  const startGame = useCallback(() => {
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setTotalAttempts(0)
    setCorrectAttempts(0)
    setTimeLeft(GAME_DURATION_SECONDS)
    setGameState('playing')
    nextPair()
  }, [nextPair])

  // Answer handler
  const handleAnswer = useCallback(
    (userSaidMatch: boolean) => {
      if (gameState !== 'playing' || !currentWord) return

      const wasCorrect = userSaidMatch === isMatch
      setTotalAttempts((prev) => prev + 1)

      if (wasCorrect) {
        setCorrectAttempts((prev) => prev + 1)
        const nextStreak = streak + 1
        setStreak(nextStreak)
        if (nextStreak > maxStreak) setMaxStreak(nextStreak)

        // Combo multiplier: 1x (0-2), 2x (3-5), 3x (6-9), 5x (10+)
        const multiplier = nextStreak >= 10 ? 5 : nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1
        setScore((prev) => prev + 100 * multiplier)
        setFeedbackEffect('correct')
      } else {
        setStreak(0)
        setFeedbackEffect('wrong')
      }

      window.setTimeout(() => {
        nextPair()
      }, 180)
    },
    [gameState, currentWord, isMatch, streak, maxStreak, nextPair],
  )

  // Timer countdown
  const scoreRef = useRef(score)
  const highScoreRef = useRef(highScore)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setGameState('gameover')
            // Update high score inline (no separate effect needed)
            if (scoreRef.current > highScoreRef.current) {
              setHighScore(scoreRef.current)
              storage.set(highscoreKey, scoreRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, highscoreKey])

  // Keyboard controls during game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowLeft' || e.key === '1') {
          e.preventDefault()
          handleAnswer(false)
        } else if (e.key === 'ArrowRight' || e.key === '2') {
          e.preventDefault()
          handleAnswer(true)
        }
      } else if (gameState === 'idle' || gameState === 'gameover') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault()
          startGame()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, handleAnswer, startGame])

  const comboMultiplier = useMemo(() => {
    if (streak >= 10) return 5
    if (streak >= 6) return 3
    if (streak >= 3) return 2
    return 1
  }, [streak])

  const accuracyPct = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  return (
    <div className="trainer-sprint-container">
      {gameState === 'idle' && (
        <div className="sprint-splash">
          <div className="sprint-splash-icon">
            <Zap size={44} />
          </div>
          <h2>⚡ Спринт-челлендж (45 секунд)</h2>
          <p>
            Быстрая проверка словарного запаса на скорость! Смотри на слово и предложенный перевод — и моментально решай, верно или нет. За
            серии правильных ответов включается комбо-множитель до 5x!
          </p>

          <div className="sprint-splash-meta">
            <div className="sprint-meta-badge">
              <Trophy size={16} />
              <span>Рекорд: {highScore} очков</span>
            </div>
            <div className="sprint-meta-badge">
              <span>⏱️ Время: 45 сек</span>
            </div>
          </div>

          <div className="sprint-splash-actions">
            <button type="button" className="trainer-btn trainer-btn--mastered sprint-start-btn" onClick={startGame}>
              <Play size={20} />
              <span>Начать спринт! (Пробел)</span>
            </button>
            <button type="button" className="trainer-btn trainer-btn--secondary" onClick={onExit}>
              Назад к тренажёру
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentWord && (
        <div className={`sprint-playfield ${feedbackEffect ? `flash-${feedbackEffect}` : ''}`}>
          {/* Top Hud */}
          <div className="sprint-hud">
            <div className="sprint-timer-badge">
              <span className="timer-number">{timeLeft}s</span>
              <div
                className="timer-bar-fill"
                style={{
                  width: `${(timeLeft / GAME_DURATION_SECONDS) * 100}%`,
                  backgroundColor: timeLeft <= 10 ? 'var(--danger, #ef4444)' : 'var(--accent)',
                }}
              />
            </div>

            <div className="sprint-hud-center">
              {streak >= 3 && (
                <div className="sprint-combo-badge">
                  <Flame size={18} className="flame-icon" />
                  <span>x{comboMultiplier} КОМБО!</span>
                </div>
              )}
            </div>

            <div className="sprint-score-badge">
              <span className="score-val">{score}</span>
              <small>очков</small>
            </div>
          </div>

          {/* Card to Evaluate */}
          <div className="sprint-card">
            <div className="sprint-word-prompt">
              <span className="sprint-hint">Оригинал:</span>
              <h2 className="sprint-term">{currentWord.term}</h2>
              {currentWord.transcription && <div className="trainer-transcription">{currentWord.transcription}</div>}
            </div>

            <div className="sprint-divider">
              <span>равно?</span>
            </div>

            <div className="sprint-translation-prompt">
              <span className="sprint-hint">Предложенный перевод:</span>
              <h3 className="sprint-suggested">{suggestedTranslation}</h3>
            </div>
          </div>

          {/* True / False Buttons */}
          <div className="sprint-action-buttons">
            <button
              type="button"
              className="sprint-btn sprint-btn--false"
              onClick={() => handleAnswer(false)}
              aria-label="Неверно (1 или Стрелка влево)"
            >
              <X size={24} />
              <span>НЕВЕРНО (1 / ←)</span>
            </button>

            <button
              type="button"
              className="sprint-btn sprint-btn--true"
              onClick={() => handleAnswer(true)}
              aria-label="Верно (2 или Стрелка вправо)"
            >
              <Check size={24} />
              <span>ВЕРНО (2 / →)</span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="sprint-gameover">
          <div className="gameover-trophy">
            <Trophy size={48} />
          </div>
          <h2>Время вышло!</h2>
          <div className="gameover-score-hero">
            <span className="hero-score-val">{score}</span>
            <span className="hero-score-label">Итоговые очки</span>
          </div>

          {score > 0 && score >= highScore && (
            <div className="gameover-new-record">
              <Flame size={18} />
              <span>🔥 Новый личный рекорд! Поздравляем!</span>
            </div>
          )}

          <div className="gameover-stats-grid">
            <div className="gameover-stat-item">
              <strong>{accuracyPct}%</strong>
              <small>Точность</small>
            </div>
            <div className="gameover-stat-item">
              <strong>
                {correctAttempts} / {totalAttempts}
              </strong>
              <small>Правильных слов</small>
            </div>
            <div className="gameover-stat-item">
              <strong>{maxStreak}</strong>
              <small>Лучшая серия 🔥</small>
            </div>
          </div>

          <div className="gameover-actions">
            <button type="button" className="trainer-btn trainer-btn--mastered" onClick={startGame}>
              <RotateCcw size={18} />
              <span>Сыграть ещё раз (Пробел)</span>
            </button>
            <button type="button" className="trainer-btn trainer-btn--secondary" onClick={onExit}>
              К обычным карточкам
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

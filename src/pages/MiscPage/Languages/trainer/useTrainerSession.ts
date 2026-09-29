import { useCallback, useMemo, useState } from 'react'
import { storage } from '../../../../lib'
import type { QuizOption, TrainerDirection, TrainerItem, TrainerMode, TrainerStats } from './trainerTypes'

type UseTrainerSessionProps = {
  items: TrainerItem[]
  storageKeyPrefix: string
}

function getSeededRandom(seed: number) {
  let s = Math.abs(seed) % 2147483647
  if (s === 0) s = 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const useTrainerSession = ({ items, storageKeyPrefix }: UseTrainerSessionProps) => {
  const learnedKey = `${storageKeyPrefix}-learned`
  const bestStreakKey = `${storageKeyPrefix}-best-streak`

  const [mode, setMode] = useState<TrainerMode>('flashcard')
  const [direction, setDirection] = useState<TrainerDirection>('direct')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [onlyUnlearned, setOnlyUnlearned] = useState(false)
  const [onlyMistakes, setOnlyMistakes] = useState(false)
  const [isShuffle, setIsShuffleState] = useState(false)
  const [shuffleSeed, setShuffleSeed] = useState(1)
  const [audioRate, setAudioRate] = useState<number>(1.0)
  const [autoPlay, setAutoPlay] = useState<boolean>(false)

  const [learnedIds, setLearnedIds] = useState<string[]>(() => storage.get<string[]>(learnedKey, []))
  const [bestStreak, setBestStreak] = useState<number>(() => storage.get<number>(bestStreakKey, 0))
  const [sessionMistakeIds, setSessionMistakeIds] = useState<string[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)

  const [currentStreak, setCurrentStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [isSessionFinished, setIsSessionFinished] = useState(false)

  // Filter pool (pure, no randomness)
  const filteredPool = useMemo(() => {
    let pool = items.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (onlyUnlearned && learnedIds.includes(item.id)) return false
      if (onlyMistakes && !sessionMistakeIds.includes(item.id)) return false
      return true
    })

    if (pool.length === 0 && (onlyUnlearned || onlyMistakes)) {
      pool = categoryFilter !== 'all' ? items.filter((item) => item.category === categoryFilter) : items
    }

    if (pool.length === 0) pool = items

    return pool
  }, [items, categoryFilter, onlyUnlearned, onlyMistakes, learnedIds, sessionMistakeIds])

  // Build queue: pure deterministic shuffle using seeded generator
  const queue = useMemo(() => {
    if (!isShuffle) return filteredPool
    const rng = getSeededRandom(shuffleSeed)
    const list = [...filteredPool]
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const temp = list[i]
      list[i] = list[j]
      list[j] = temp
    }
    return list
  }, [filteredPool, isShuffle, shuffleSeed])

  const setIsShuffle = useCallback((valOrFn: boolean | ((prev: boolean) => boolean)) => {
    setIsShuffleState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn
      if (next) {
        setShuffleSeed((s) => s + 1)
      }
      return next
    })
  }, [])

  const clampedIndex = queue.length > 0 && currentIndex >= queue.length ? 0 : currentIndex
  const currentItem = queue[clampedIndex] as TrainerItem | undefined

  // Effective direction for this card
  const effectiveDirection: 'direct' | 'reverse' = useMemo(() => {
    if (direction === 'direct') return 'direct'
    if (direction === 'reverse') return 'reverse'
    return clampedIndex % 2 === 0 ? 'direct' : 'reverse'
  }, [direction, clampedIndex])

  // Generate 4 options for Quiz & Listening modes deterministically
  const quizOptions: QuizOption[] = useMemo(() => {
    if (!currentItem) return []

    const isDirect = effectiveDirection === 'direct'
    const correctText = isDirect ? currentItem.translation : currentItem.term

    let hash = 0
    for (let i = 0; i < currentItem.id.length; i++) {
      hash = ((hash << 5) - hash + currentItem.id.charCodeAt(i)) | 0
    }
    const rng = getSeededRandom(Math.abs(hash) + clampedIndex * 17 + 11)

    // Potential distractors
    const pool = items.filter((i) => i.id !== currentItem.id)
    const shuffledPool = [...pool].sort(() => rng() - 0.5)
    const selectedDistractors = shuffledPool.slice(0, 3)

    const rawOptions: QuizOption[] = [
      { text: correctText, isCorrect: true, originalItem: currentItem },
      ...selectedDistractors.map((d) => ({
        text: isDirect ? d.translation : d.term,
        isCorrect: false,
        originalItem: d,
      })),
    ]

    return rawOptions.sort(() => rng() - 0.5)
  }, [currentItem, effectiveDirection, items, clampedIndex])

  // Record an answer result
  const recordAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentItem) return

      if (isCorrect) {
        setCorrectCount((c) => c + 1)
        setCurrentStreak((prev) => {
          const next = prev + 1
          if (next > bestStreak) {
            setBestStreak(next)
            storage.set(bestStreakKey, next)
          }
          return next
        })

        // Add to learned if not present
        if (!learnedIds.includes(currentItem.id)) {
          setLearnedIds((prev) => {
            const next = [...prev, currentItem.id]
            storage.set(learnedKey, next)
            return next
          })
        }
      } else {
        setIncorrectCount((c) => c + 1)
        setCurrentStreak(0)
        setSessionMistakeIds((prev) => (prev.includes(currentItem.id) ? prev : [...prev, currentItem.id]))
      }
    },
    [currentItem, bestStreak, bestStreakKey, learnedIds, learnedKey],
  )

  // Advance to next card
  const advanceNext = useCallback(() => {
    setIsRevealed(false)
    setSelectedOption(null)
    setIsAnswerChecked(false)

    if (currentIndex >= queue.length - 1) {
      setIsSessionFinished(true)
    } else {
      setCurrentIndex((idx) => idx + 1)
    }
  }, [currentIndex, queue.length])

  // Flashcard direct actions
  const handleFlashcardAnswer = useCallback(
    (known: boolean) => {
      recordAnswer(known)
      advanceNext()
    },
    [recordAnswer, advanceNext],
  )

  // Quiz / Listening option selection
  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (isAnswerChecked) return
      setSelectedOption(optionIndex)
      setIsAnswerChecked(true)
      const chosen = quizOptions[optionIndex]
      if (chosen) {
        recordAnswer(chosen.isCorrect)
      }
    },
    [isAnswerChecked, quizOptions, recordAnswer],
  )

  // Restart session
  const restartSession = useCallback((mistakesOnly = false) => {
    if (mistakesOnly) {
      setOnlyMistakes(true)
    } else {
      setOnlyMistakes(false)
    }
    setShuffleSeed((s) => s + 1)
    setCurrentIndex(0)
    setIsRevealed(false)
    setSelectedOption(null)
    setIsAnswerChecked(false)
    setIsSessionFinished(false)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCurrentStreak(0)
  }, [])

  // Reset all learned progress
  const resetAllProgress = useCallback(() => {
    setLearnedIds([])
    storage.remove(learnedKey)
    setBestStreak(0)
    storage.remove(bestStreakKey)
    setSessionMistakeIds([])
    restartSession(false)
  }, [learnedKey, bestStreakKey, restartSession])

  const stats: TrainerStats = {
    totalAnswered: correctCount + incorrectCount,
    correctCount,
    incorrectCount,
    currentStreak,
    bestStreak,
    mistakeIds: sessionMistakeIds,
    learnedIds,
  }

  return {
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
    currentIndex: clampedIndex,
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
    resetAllProgress,
    stats,
    isSessionFinished,
    setIsSessionFinished,
  }
}

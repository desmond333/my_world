export type TrainerItem = {
  id: string
  term: string
  translation: string
  transcription?: string
  category: string
  badge?: string
  meaning?: string
  example?: string
  exampleRu?: string
  langCode: 'en-US' | 'ka-GE'
}

export type TrainerMode = 'flashcard' | 'quiz' | 'listening' | 'sprint'

export type TrainerDirection = 'direct' | 'reverse' | 'mixed'

export type TrainerStats = {
  totalAnswered: number
  correctCount: number
  incorrectCount: number
  currentStreak: number
  bestStreak: number
  mistakeIds: string[]
  learnedIds: string[]
}

export type QuizOption = {
  text: string
  isCorrect: boolean
  originalItem: TrainerItem
}

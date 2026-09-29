export type TrainerItem = {
  id: string
  term: string // Target word / Georgian script
  translation: string // Russian translation
  transcription?: string // IPA or Russian transliteration
  category: string
  badge?: string // e.g. "YouTube", "WSJ", "Связка", "Кафе"
  meaning?: string // Deep explanation / usage note
  example?: string // Example sentence in target language
  exampleRu?: string // Example sentence in Russian
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

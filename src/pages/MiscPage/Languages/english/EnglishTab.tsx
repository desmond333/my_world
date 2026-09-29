import { useMemo, useState } from 'react'
import { BookOpen, Check, Copy, GraduationCap, Newspaper, Search, Sparkles, Volume2 } from 'lucide-react'
import { useCopyFeedback, useSpeechSynthesis } from '../../../../hooks'
import { useTranslation } from '../../../../lib/i18n'
import { ENGLISH_CATEGORIES, ENGLISH_WORDS, type EnglishWord } from './englishData'
import { EnglishReadingView } from './EnglishReadingView'
import { LanguageTrainer, type TrainerItem } from '../trainer'

export const EnglishTab = () => {
  const { lang, t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'list' | 'trainer' | 'reading'>('list')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { copy } = useCopyFeedback()
  const { speak, playingId } = useSpeechSynthesis()

  const handleCopyWord = (word: EnglishWord) => {
    void copy(`${word.term} — ${word.translation}`)
    setCopiedId(word.id)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  const speakTerm = (word: EnglishWord) => {
    speak({
      id: word.id,
      text: word.term,
      lang: 'en-US',
      rate: 0.95,
      pitch: 1.0,
    })
  }

  const filteredWords = useMemo(() => {
    return ENGLISH_WORDS.filter((word) => {
      const matchesCategory = activeCategory === 'all' || word.category === activeCategory
      if (!matchesCategory) return false

      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase().trim()
      return (
        word.term.toLowerCase().includes(query) ||
        word.translation.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query) ||
        word.example.toLowerCase().includes(query) ||
        word.exampleRu.toLowerCase().includes(query)
      )
    })
  }, [activeCategory, searchQuery])

  const trainerItems: TrainerItem[] = useMemo(() => {
    return ENGLISH_WORDS.map((w) => ({
      id: w.id,
      term: w.term,
      translation: w.translation,
      transcription: w.transcription,
      category: w.category,
      badge: w.badge,
      meaning: w.meaning,
      example: w.example,
      exampleRu: w.exampleRu,
      langCode: 'en-US' as const,
    }))
  }, [])

  const trainerCategories = ENGLISH_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))

  const handleSpeakTrainer = (item: TrainerItem, rate: number) => {
    speak({
      id: item.id,
      text: item.term,
      lang: 'en-US',
      rate: rate * 0.95,
      pitch: 1.0,
    })
  }

  return (
    <div className="english-tab">
      {/* Description Banner */}
      <div className="english-hero-banner">
        <div className="english-hero-content">
          <div className="english-hero-pill">
            <Sparkles size={14} />
            <span>Advanced American English</span>
          </div>
          <h3>{lang === 'ru' ? 'Английский для YouTube и американской прессы' : 'English for YouTube & US Press'}</h3>
          <p>
            {lang === 'ru'
              ? 'Слова и обороты, которые американские авторы используют в видео-эссе, подкастах и статьях The Wall Street Journal, а также аутентичные тексты для практики чтения.'
              : 'Phrases and vocabulary used in American video essays, top podcasts, Wall Street Journal articles, and authentic reading texts.'}
          </p>
        </div>
      </div>

      {/* Mode & Category Bar */}
      <div className="english-toolbar">
        <div className="english-mode-switch" role="group" aria-label="Режим обучения">
          <button type="button" className={`english-mode-btn ${mode === 'list' ? 'active' : ''}`} onClick={() => setMode('list')}>
            <BookOpen size={16} />
            <span className="mode-btn-full">{t('langPage.allCards')}</span>
            <span className="mode-btn-short">{lang === 'ru' ? 'Словарь' : 'Cards'}</span>
            <span className="mode-badge">{filteredWords.length}</span>
          </button>
          <button type="button" className={`english-mode-btn ${mode === 'trainer' ? 'active' : ''}`} onClick={() => setMode('trainer')}>
            <GraduationCap size={16} />
            <span className="mode-btn-full">{t('langPage.flashcards')}</span>
            <span className="mode-btn-short">{lang === 'ru' ? 'Тренажёр' : 'Trainer'}</span>
          </button>
          <button type="button" className={`english-mode-btn ${mode === 'reading' ? 'active' : ''}`} onClick={() => setMode('reading')}>
            <Newspaper size={16} />
            <span className="mode-btn-full">{lang === 'ru' ? 'Тексты для чтения' : 'Reading Practice'}</span>
            <span className="mode-btn-short">{lang === 'ru' ? 'Чтение' : 'Reading'}</span>
            <span className="mode-badge">3</span>
          </button>
        </div>

        {/* Search (only for vocabulary cards) */}
        {mode === 'list' && (
          <div className="english-search-wrap">
            <Search size={16} className="english-search-icon" />
            <input
              type="search"
              className="english-search-input"
              placeholder={t('langPage.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="english-search-clear" onClick={() => setSearchQuery('')} aria-label={t('common.cancel')}>
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Chips (only for vocabulary list) */}
      {mode === 'list' && (
        <div className="english-categories">
          {ENGLISH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`english-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.hint}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Trainer Mode — New unified trainer */}
      {mode === 'trainer' && (
        <LanguageTrainer
          items={trainerItems}
          categories={trainerCategories}
          storageKeyPrefix="english"
          title="English Trainer"
          onSpeak={handleSpeakTrainer}
          playingId={playingId}
          onExit={() => setMode('list')}
        />
      )}

      {/* Vocabulary List Mode */}
      {mode === 'list' && (
        <div className="english-words-grid">
          {filteredWords.length === 0 ? (
            <div className="english-empty-state">
              <p>{t('common.empty')}</p>
            </div>
          ) : (
            filteredWords.map((word) => {
              const isCopied = copiedId === word.id

              return (
                <article key={word.id} className="english-card">
                  <div className="english-card-header">
                    <div className="english-card-titles">
                      <div className="english-term-row">
                        <h4 className="english-term">{word.term}</h4>
                        <span className="english-transcription">{word.transcription}</span>
                      </div>
                      <span className="english-card-badge">{word.badge}</span>
                    </div>

                    <div className="english-card-actions">
                      <button
                        type="button"
                        className={`english-icon-btn ${playingId === word.id ? 'playing' : ''}`}
                        onClick={() => speakTerm(word)}
                        title="Произношение (US)"
                        aria-label="Произношение"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="english-icon-btn"
                        onClick={() => handleCopyWord(word)}
                        title="Скопировать"
                        aria-label="Скопировать"
                      >
                        {isCopied ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="english-translation-row">
                    <span className="english-translation">{word.translation}</span>
                  </div>

                  <div className="english-context-row">
                    <span className="english-context-label">{t('langPage.context')}:</span>
                    <p className="english-meaning">{word.meaning}</p>
                  </div>

                  <div className="english-example-block">
                    <div className="english-example-en">
                      <span className="example-quote">"</span>
                      <span>{word.example}</span>
                      <span className="example-quote">"</span>
                    </div>
                    <div className="english-example-ru">{word.exampleRu}</div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {/* Reading Practice Mode */}
      {mode === 'reading' && <EnglishReadingView />}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { BookOpen, Check, ChevronDown, ChevronUp, Copy, GraduationCap, Search, Sparkles, Star, Volume2 } from 'lucide-react'
import { useCopyFeedback, useSpeechSynthesis } from '../../../../hooks'
import { storage } from '../../../../lib'
import { GEORGIAN_CATEGORIES, GEORGIAN_PHRASES, type GeorgianPhrase, PRONUNCIATION_RULES } from './georgianData'
import { LanguageTrainer, type TrainerItem } from '../trainer'
import './GeorgianTab.css'

const FAVORITES_STORAGE_KEY = 'georgian-favorite-phrases'

export const GeorgianTab = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rulesOpen, setRulesOpen] = useState(true)
  const [mode, setMode] = useState<'phrasebook' | 'trainer'>('phrasebook')

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => storage.get<string[]>(FAVORITES_STORAGE_KEY, []))

  const { copied, copy } = useCopyFeedback()
  const { speak, playingId } = useSpeechSynthesis()

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      storage.set(FAVORITES_STORAGE_KEY, next)
      return next
    })
  }

  const speakPhrase = (phrase: GeorgianPhrase) => {
    const voices = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []
    const kaVoice = voices.find((v) => v.lang.startsWith('ka') || v.lang === 'ka-GE')

    if (kaVoice) {
      speak({
        id: phrase.id,
        text: phrase.ka,
        lang: 'ka-GE',
        rate: 0.85,
        voice: kaVoice,
      })
    } else {
      const cleanedTranscription = phrase.transcription
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/ó/g, 'о')
        .replace(/á/g, 'а')
        .replace(/ú/g, 'у')
        .replace(/é/g, 'е')

      speak({
        id: phrase.id,
        text: cleanedTranscription,
        lang: 'ru-RU',
        rate: 0.85,
      })
    }
  }

  const filteredPhrases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return GEORGIAN_PHRASES.filter((phrase) => {
      const matchesCat =
        activeCategory === 'all'
          ? true
          : activeCategory === 'favorites'
            ? favoriteIds.includes(phrase.id)
            : phrase.category === activeCategory

      if (!matchesCat) return false
      if (!q) return true

      return (
        phrase.ru.toLowerCase().includes(q) ||
        phrase.transcription.toLowerCase().includes(q) ||
        phrase.ka.toLowerCase().includes(q) ||
        (phrase.tip && phrase.tip.toLowerCase().includes(q))
      )
    })
  }, [activeCategory, searchQuery, favoriteIds])

  // Trainer items adapter: Georgian phrases → TrainerItem[]
  const trainerItems: TrainerItem[] = useMemo(() => {
    return GEORGIAN_PHRASES.map((p) => ({
      id: p.id,
      term: p.transcription, // Show transcription as the "word" to learn
      translation: p.ru,
      transcription: p.ka, // Georgian script as secondary info
      category: p.category,
      badge: GEORGIAN_CATEGORIES.find((c) => c.id === p.category)?.icon,
      meaning: p.tip,
      example: p.literal,
      langCode: 'ka-GE' as const,
    }))
  }, [])

  const trainerCategories = GEORGIAN_CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon }))

  const handleSpeakTrainer = (item: TrainerItem, rate: number) => {
    const phrase = GEORGIAN_PHRASES.find((p) => p.id === item.id)
    if (phrase) {
      const voices = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []
      const kaVoice = voices.find((v) => v.lang.startsWith('ka') || v.lang === 'ka-GE')

      if (kaVoice) {
        speak({
          id: phrase.id,
          text: phrase.ka,
          lang: 'ka-GE',
          rate: rate * 0.85,
          voice: kaVoice,
        })
      } else {
        const cleanedTranscription = phrase.transcription
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/ó/g, 'о')
          .replace(/á/g, 'а')
          .replace(/ú/g, 'у')
          .replace(/é/g, 'е')

        speak({
          id: phrase.id,
          text: cleanedTranscription,
          lang: 'ru-RU',
          rate: rate * 0.85,
        })
      }
    }
  }

  return (
    <div className="georgian-page">
      <div className="georgian-hero-banner">
        <div className="georgian-hero-content">
          <div className="georgian-hero-pill">
            <Sparkles size={14} />
            <span>Грузинский разговорник</span>
          </div>
          <h3>Разговорный грузинский с русской транскрипцией</h3>
          <p>Читай транскрипцию по-русски, слушай озвучку фраз и тренируй речь для поездок, ресторанов, такси и душевных бесед.</p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="georgian-mode-bar">
        <div className="georgian-mode-switch">
          <button
            type="button"
            className={`georgian-mode-btn${mode === 'phrasebook' ? ' is-active' : ''}`}
            onClick={() => setMode('phrasebook')}
          >
            <BookOpen size={16} />
            <span className="mode-btn-full">Разговорник ({filteredPhrases.length})</span>
            <span className="mode-btn-short">Фразы ({filteredPhrases.length})</span>
          </button>
          <button type="button" className={`georgian-mode-btn${mode === 'trainer' ? ' is-active' : ''}`} onClick={() => setMode('trainer')}>
            <GraduationCap size={16} />
            <span className="mode-btn-full">Тренажёр карточек</span>
            <span className="mode-btn-short">Тренажёр</span>
          </button>
        </div>

        {favoriteIds.length > 0 && mode === 'phrasebook' && (
          <button
            type="button"
            className={`georgian-fav-filter-btn${activeCategory === 'favorites' ? ' is-active' : ''}`}
            onClick={() => setActiveCategory((prev) => (prev === 'favorites' ? 'all' : 'favorites'))}
          >
            <Star size={14} fill={activeCategory === 'favorites' ? 'currentColor' : 'none'} />
            <span className="mode-btn-full">Избранные фразы ({favoriteIds.length})</span>
            <span className="mode-btn-short">Избранное ({favoriteIds.length})</span>
          </button>
        )}
      </div>

      {/* Pronunciation Guide (Collapsible) */}
      <section className="georgian-rules-card">
        <button type="button" className="georgian-rules-toggle" onClick={() => setRulesOpen((prev) => !prev)} aria-expanded={rulesOpen}>
          <div className="georgian-rules-head">
            <span className="georgian-rules-badge">
              <Sparkles size={14} /> Произношение
            </span>
            <h3>Как читать по-грузински: памятка звуков и ударений</h3>
          </div>
          {rulesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {rulesOpen && (
          <div className="georgian-rules-body">
            <p className="georgian-rules-lead">
              В грузинском алфавите 33 буквы, нет родов (он, она, оно выражаются одинаково), а ударение не растягивает слог. Вот главное,
              чтобы тебя сразу понимали:
            </p>
            <div className="georgian-rules-grid">
              {PRONUNCIATION_RULES.map((rule) => (
                <div key={rule.letter} className="georgian-rule-item">
                  <div className="georgian-rule-top">
                    <strong>{rule.letter}</strong>
                    <span className="georgian-rule-sound">{rule.sound}</span>
                  </div>
                  <p className="georgian-rule-example">
                    Пример: <em>{rule.example}</em>
                  </p>
                  <p className="georgian-rule-tip">{rule.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Trainer Mode — New unified trainer */}
      {mode === 'trainer' ? (
        <LanguageTrainer
          items={trainerItems}
          categories={trainerCategories}
          storageKeyPrefix="georgian"
          title="Georgian Trainer"
          onSpeak={handleSpeakTrainer}
          playingId={playingId}
          onExit={() => setMode('phrasebook')}
        />
      ) : (
        /* Phrasebook Mode */
        <>
          {/* Search & Categories Bar */}
          <section className="georgian-controls">
            <div className="georgian-search-box">
              <Search size={16} className="georgian-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск фразы: здравствуйте, хинкали, счет, мадлоба, такси..."
              />
              {searchQuery && (
                <button type="button" className="georgian-search-clear" onClick={() => setSearchQuery('')} title="Очистить">
                  ×
                </button>
              )}
            </div>

            <div className="georgian-cats-scroll">
              {GEORGIAN_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`georgian-cat-chip${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                    title={cat.desc}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Phrases Grid */}
          {filteredPhrases.length === 0 ? (
            <div className="georgian-empty">
              <p>По запросу «{searchQuery}» ничего не найдено.</p>
              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
              >
                Показать все фразы
              </button>
            </div>
          ) : (
            <div className="georgian-phrases-grid">
              {filteredPhrases.map((phrase) => {
                const isFav = favoriteIds.includes(phrase.id)
                const isPlaying = playingId === phrase.id

                return (
                  <article key={phrase.id} className="georgian-card">
                    <div className="georgian-card-top">
                      <h3 className="georgian-card-ru">{phrase.ru}</h3>
                      <button
                        type="button"
                        className={`georgian-card-star${isFav ? ' is-fav' : ''}`}
                        onClick={() => toggleFavorite(phrase.id)}
                        title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                      >
                        <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Prominent Russian Transcription */}
                    <div className="georgian-transcription-box">
                      <span className="georgian-transcription-label">как читать:</span>
                      <strong className="georgian-transcription-text">{phrase.transcription}</strong>
                    </div>

                    {/* Georgian Script */}
                    <div className="georgian-ka-row">
                      <span className="georgian-ka-text">{phrase.ka}</span>
                    </div>

                    {/* Tips & Literal */}
                    {phrase.tip && (
                      <p className="georgian-card-tip">
                        💡 <strong>Произношение:</strong> {phrase.tip}
                      </p>
                    )}

                    {phrase.literal && <p className="georgian-card-literal">{phrase.literal}</p>}

                    {/* Card Actions */}
                    <div className="georgian-card-actions">
                      <button
                        type="button"
                        className={`georgian-btn-sound${isPlaying ? ' is-playing' : ''}`}
                        onClick={() => speakPhrase(phrase)}
                        title="Послушать произношение"
                      >
                        <Volume2 size={15} />
                        <span>{isPlaying ? 'Звучит...' : 'Слушать'}</span>
                      </button>

                      <button
                        type="button"
                        className="georgian-btn-copy"
                        onClick={() => copy(`${phrase.ka} (${phrase.transcription})`)}
                        title="Скопировать фразу с транскрипцией"
                      >
                        <Copy size={14} />
                        <span>Копировать</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {copied && (
            <div className="georgian-toast" role="status" aria-live="polite">
              <Check size={16} /> Фраза скопирована в буфер обмена!
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { GeorgianTab as GeorgianPage }

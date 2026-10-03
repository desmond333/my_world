import { useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../../../../lib/storage'
import { BookOpen, Check, ChevronDown, ChevronUp, Copy, GraduationCap, Search, Sparkles, Star, Volume2 } from 'lucide-react'
import { useCopyFeedback, usePersistentState, useSpeechSynthesis } from '../../../../hooks'
import { useTranslation } from '../../../../lib/i18n'
import { GEORGIAN_CATEGORIES, GEORGIAN_PHRASES, type GeorgianPhrase, PRONUNCIATION_RULES } from './georgianData'
import { LanguageTrainer, type TrainerItem } from '../trainer'
import { Tabs, TabsList, TabsTrigger } from '../../../../shared/ui'
import './GeorgianTab.css'

const FAVORITES_STORAGE_KEY = STORAGE_KEYS.georgianFavorites

export const GeorgianTab = () => {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rulesOpen, setRulesOpen] = useState(true)
  const [mode, setMode] = useState<'phrasebook' | 'trainer'>('phrasebook')

  const [favoriteIds, setFavoriteIds] = usePersistentState<string[]>(FAVORITES_STORAGE_KEY, [])

  const { copied, copy } = useCopyFeedback()
  const { speak, playingId } = useSpeechSynthesis()

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  const trainerItems: TrainerItem[] = useMemo(() => {
    return GEORGIAN_PHRASES.map((p) => ({
      id: p.id,
      term: p.transcription,
      translation: p.ru,
      transcription: p.ka,
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
            <span>{t('lang.ka.heroPill')}</span>
          </div>
          <h3>{t('lang.ka.heroTitle')}</h3>
          <p>{t('lang.ka.heroNote')}</p>
        </div>
      </div>

      <div className="georgian-mode-bar">
        <Tabs value={mode} onValueChange={(val) => setMode(val as 'phrasebook' | 'trainer')}>
          <TabsList aria-label={t('lang.ka.phrasebook')}>
            <TabsTrigger value="phrasebook">
              <BookOpen size={16} />
              <span className="mode-btn-full">
                {t('lang.ka.phrasebook')} ({filteredPhrases.length})
              </span>
              <span className="mode-btn-short">
                {t('lang.ka.phrasebookShort')} ({filteredPhrases.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="trainer">
              <GraduationCap size={16} />
              <span className="mode-btn-full">{t('lang.ka.trainer')}</span>
              <span className="mode-btn-short">{t('lang.ka.trainerShort')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {favoriteIds.length > 0 && mode === 'phrasebook' && (
          <button
            type="button"
            className={`georgian-fav-filter-btn${activeCategory === 'favorites' ? ' is-active' : ''}`}
            onClick={() => setActiveCategory((prev) => (prev === 'favorites' ? 'all' : 'favorites'))}
          >
            <Star size={14} fill={activeCategory === 'favorites' ? 'currentColor' : 'none'} />
            <span className="mode-btn-full">
              {t('lang.ka.favorites')} ({favoriteIds.length})
            </span>
            <span className="mode-btn-short">
              {t('lang.ka.favoritesShort')} ({favoriteIds.length})
            </span>
          </button>
        )}
      </div>

      <section className="georgian-rules-card">
        <button type="button" className="georgian-rules-toggle" onClick={() => setRulesOpen((prev) => !prev)} aria-expanded={rulesOpen}>
          <div className="georgian-rules-head">
            <span className="georgian-rules-badge">
              <Sparkles size={14} /> {t('lang.ka.rulesBadge')}
            </span>
            <h3>{t('lang.ka.rulesTitle')}</h3>
          </div>
          {rulesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {rulesOpen && (
          <div className="georgian-rules-body">
            <p className="georgian-rules-lead">{t('lang.ka.rulesLead')}</p>
            <div className="georgian-rules-grid">
              {PRONUNCIATION_RULES.map((rule) => (
                <div key={rule.letter} className="georgian-rule-item">
                  <div className="georgian-rule-top">
                    <strong>{rule.letter}</strong>
                    <span className="georgian-rule-sound">{rule.sound}</span>
                  </div>
                  <p className="georgian-rule-example">
                    {t('lang.ka.example')} <em>{rule.example}</em>
                  </p>
                  <p className="georgian-rule-tip">{rule.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {mode === 'trainer' ? (
        <LanguageTrainer
          items={trainerItems}
          categories={trainerCategories}
          storageKeyPrefix="georgian"
          title={t('lang.ka.trainerTitle')}
          onSpeak={handleSpeakTrainer}
          playingId={playingId}
          onExit={() => setMode('phrasebook')}
        />
      ) : (
        <>
          <section className="georgian-controls">
            <div className="georgian-search-box">
              <Search size={16} className="georgian-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('lang.ka.searchPlaceholder')}
              />
              {searchQuery && (
                <button type="button" className="georgian-search-clear" onClick={() => setSearchQuery('')} title={t('lang.ka.clear')}>
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

          {filteredPhrases.length === 0 ? (
            <div className="georgian-empty">
              <p>{t('lang.ka.notFound', undefined, { term: searchQuery })}</p>
              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
              >
                {t('lang.ka.showAll')}
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
                        title={isFav ? t('lang.ka.favRemove') : t('lang.ka.favAdd')}
                      >
                        <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="georgian-transcription-box">
                      <span className="georgian-transcription-label">{t('lang.ka.readAs')}</span>
                      <strong className="georgian-transcription-text">{phrase.transcription}</strong>
                    </div>

                    <div className="georgian-ka-row">
                      <span className="georgian-ka-text">{phrase.ka}</span>
                    </div>

                    {phrase.tip && (
                      <p className="georgian-card-tip">
                        💡 <strong>{t('lang.ka.pronunciation')}</strong> {phrase.tip}
                      </p>
                    )}

                    {phrase.literal && <p className="georgian-card-literal">{phrase.literal}</p>}

                    <div className="georgian-card-actions">
                      <button
                        type="button"
                        className={`georgian-btn-sound${isPlaying ? ' is-playing' : ''}`}
                        onClick={() => speakPhrase(phrase)}
                        title={t('lang.ka.listenTitle')}
                      >
                        <Volume2 size={15} />
                        <span>{isPlaying ? t('lang.ka.playing') : t('lang.ka.listen')}</span>
                      </button>

                      <button
                        type="button"
                        className="georgian-btn-copy"
                        onClick={() => copy(`${phrase.ka} (${phrase.transcription})`)}
                        title={t('lang.ka.copyTitle')}
                      >
                        <Copy size={14} />
                        <span>{t('common.copy')}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {copied && (
            <div className="georgian-toast" role="status" aria-live="polite">
              <Check size={16} /> {t('lang.ka.copied')}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { GeorgianTab as GeorgianPage }

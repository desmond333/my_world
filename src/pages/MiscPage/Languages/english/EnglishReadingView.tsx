import { useState } from 'react'
import { ArrowLeft, BookOpen, Clock, ExternalLink, Flame, Languages, Pause, Play, Sparkles, Square, Type, Volume2 } from 'lucide-react'
import { useSpeechSynthesis } from '../../../../hooks'
import { useTranslation } from '../../../../lib/i18n'
import { READING_ARTICLES, type ReadingArticle, type ReadingParagraph, type ReadingVocabularyItem } from './readingData'

export const EnglishReadingView = () => {
  const { lang } = useTranslation()
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'youtube' | 'press' | 'tech'>('all')
  const [showAllTranslations, setShowAllTranslations] = useState(false)
  const [revealedParagraphs, setRevealedParagraphs] = useState<Record<string, boolean>>({})
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')

  const { speak, cancel, pause, resume, playingId, isSpeaking, isPaused } = useSpeechSynthesis()

  const selectedArticle = READING_ARTICLES.find((a) => a.id === selectedArticleId) ?? null

  const filteredArticles = READING_ARTICLES.filter((article) => {
    if (selectedCategory === 'all') return true
    return article.category === selectedCategory
  })

  const toggleParagraphTranslation = (paragraphId: string) => {
    setRevealedParagraphs((prev) => ({
      ...prev,
      [paragraphId]: !prev[paragraphId],
    }))
  }

  const handlePlayParagraph = (paragraph: ReadingParagraph) => {
    if (playingId === paragraph.id && isSpeaking) {
      cancel()
      return
    }

    speak({
      id: paragraph.id,
      text: paragraph.en,
      lang: 'en-US',
      rate: 0.92,
    })
  }

  const handlePlayFullArticle = (article: ReadingArticle) => {
    if (playingId === `full-${article.id}`) {
      if (isSpeaking && !isPaused) {
        pause()
      } else if (isPaused) {
        resume()
      } else {
        cancel()
      }
      return
    }

    const fullText = article.paragraphs.map((p) => p.en).join(' ')
    speak({
      id: `full-${article.id}`,
      text: fullText,
      lang: 'en-US',
      rate: 0.92,
    })
  }

  const handleSpeakTerm = (vocab: ReadingVocabularyItem) => {
    speak({
      id: `vocab-${vocab.term}`,
      text: vocab.term,
      lang: 'en-US',
      rate: 0.9,
    })
  }

  // --- Article Reading Screen ---
  if (selectedArticle) {
    const isPlayingFull = playingId === `full-${selectedArticle.id}`

    return (
      <div className="reading-article-view">
        {/* Navigation & Controls Top Bar */}
        <div className="reading-top-toolbar">
          <button
            type="button"
            className="reading-back-btn"
            onClick={() => {
              cancel()
              setSelectedArticleId(null)
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'en' ? 'All articles' : 'Все тексты'}</span>
          </button>

          <div className="reading-settings-controls">
            {/* Font Size Selector */}
            <div className="reading-font-toggle" title={lang === 'en' ? 'Font size' : 'Размер шрифта'}>
              <Type size={14} />
              <button type="button" className={`reading-size-btn ${fontSize === 'sm' ? 'active' : ''}`} onClick={() => setFontSize('sm')}>
                A
              </button>
              <button type="button" className={`reading-size-btn ${fontSize === 'md' ? 'active' : ''}`} onClick={() => setFontSize('md')}>
                A+
              </button>
              <button type="button" className={`reading-size-btn ${fontSize === 'lg' ? 'active' : ''}`} onClick={() => setFontSize('lg')}>
                A++
              </button>
            </div>

            {/* Global Translation Toggle */}
            <button
              type="button"
              className={`reading-toggle-trans-btn ${showAllTranslations ? 'is-active' : ''}`}
              onClick={() => setShowAllTranslations((prev) => !prev)}
            >
              <Languages size={15} />
              <span className="trans-btn-full">
                {showAllTranslations
                  ? lang === 'en'
                    ? 'Hide Russian'
                    : 'Скрыть перевод'
                  : lang === 'en'
                    ? 'Show Russian'
                    : 'Параллельный перевод'}
              </span>
              <span className="trans-btn-short">
                {showAllTranslations ? (lang === 'en' ? 'Hide' : 'Скрыть') : lang === 'en' ? 'RU' : 'Перевод'}
              </span>
            </button>
          </div>
        </div>

        {/* Article Header Card */}
        <header className="reading-article-header">
          <div className="reading-article-meta-row">
            <span className="reading-category-pill">
              <Sparkles size={12} />
              {lang === 'en' ? selectedArticle.categoryLabel : selectedArticle.categoryLabelRu}
            </span>
            <span className="reading-level-badge">{selectedArticle.level}</span>
            <span className="reading-time-tag">
              <Clock size={13} /> {selectedArticle.readMinutes} {lang === 'en' ? 'min read' : 'мин чтения'}
            </span>
          </div>

          <h2 className="reading-article-title">{selectedArticle.title}</h2>
          <p className="reading-article-title-ru">{selectedArticle.titleRu}</p>
          <p className="reading-article-subtitle">{selectedArticle.subtitle}</p>

          {/* Full Audio Playback Bar */}
          <div className="reading-audio-bar">
            <button
              type="button"
              className={`reading-audio-play-btn ${isPlayingFull ? 'is-playing' : ''}`}
              onClick={() => handlePlayFullArticle(selectedArticle)}
            >
              {isPlayingFull && isSpeaking && !isPaused ? (
                <>
                  <Pause size={16} /> {lang === 'en' ? 'Pause full audio' : 'Пауза'}
                </>
              ) : isPlayingFull && isPaused ? (
                <>
                  <Play size={16} /> {lang === 'en' ? 'Resume audio' : 'Продолжить'}
                </>
              ) : (
                <>
                  <Volume2 size={16} /> {lang === 'en' ? 'Listen to full article' : 'Озвучить весь текст'}
                </>
              )}
            </button>

            {isPlayingFull && (
              <button
                type="button"
                className="reading-audio-stop-btn"
                onClick={cancel}
                title={lang === 'en' ? 'Stop audio' : 'Остановить озвучку'}
              >
                <Square size={14} />
              </button>
            )}

            <span className="reading-audio-hint">
              {lang === 'en' ? 'Native American TTS pronunciation · Zero cost' : 'Американское произношение Web Speech API · 0 ₽'}
            </span>
          </div>
        </header>

        {/* Article Body */}
        <div className={`reading-article-body size-${fontSize}`}>
          {selectedArticle.paragraphs.map((paragraph, index) => {
            const isPlayingThis = playingId === paragraph.id
            const isRevealed = showAllTranslations || Boolean(revealedParagraphs[paragraph.id])

            return (
              <article key={paragraph.id} className={`reading-paragraph-card ${isPlayingThis ? 'is-playing-para' : ''}`}>
                <div className="reading-paragraph-header">
                  <span className="reading-para-num">§ {String(index + 1).padStart(2, '0')}</span>

                  <div className="reading-para-actions">
                    <button
                      type="button"
                      className={`reading-para-btn ${isPlayingThis ? 'is-active' : ''}`}
                      onClick={() => handlePlayParagraph(paragraph)}
                      title={lang === 'en' ? 'Listen to this paragraph' : 'Озвучить этот абзац'}
                      aria-label={`Озвучить абзац ${index + 1}`}
                    >
                      <Volume2 size={14} />
                      <span>{isPlayingThis ? (lang === 'en' ? 'Playing' : 'Звучит...') : lang === 'en' ? 'Listen' : 'Слушать'}</span>
                    </button>

                    <button
                      type="button"
                      className={`reading-para-btn ${isRevealed ? 'is-active' : ''}`}
                      onClick={() => toggleParagraphTranslation(paragraph.id)}
                      title={lang === 'en' ? 'Toggle Russian translation' : 'Показать перевод на русский'}
                    >
                      <Languages size={14} />
                      <span>{isRevealed ? (lang === 'en' ? 'Hide' : 'Скрыть') : lang === 'en' ? 'Translate' : 'Перевод'}</span>
                    </button>
                  </div>
                </div>

                {/* English Text */}
                <p className="reading-paragraph-text-en">{paragraph.en}</p>

                {/* Russian Translation (Expandable) */}
                {isRevealed && (
                  <div className="reading-paragraph-text-ru">
                    <p>{paragraph.ru}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Key Vocabulary Section for this Article */}
        <section className="reading-vocab-section">
          <div className="reading-vocab-head">
            <div className="reading-vocab-badge">
              <BookOpen size={14} />
              <span>{lang === 'en' ? 'Key Vocabulary in this text' : 'Ключевая лексика этого текста'}</span>
            </div>
            <h3>{lang === 'en' ? 'Advanced Phrasing & Context' : 'Продвинутые термины и выражения'}</h3>
          </div>

          <div className="reading-vocab-grid">
            {selectedArticle.keyVocabulary.map((vocab) => {
              const isPlayingVocab = playingId === `vocab-${vocab.term}`

              return (
                <div key={vocab.term} className="reading-vocab-card">
                  <div className="reading-vocab-top">
                    <div className="reading-vocab-term-group">
                      <strong className="reading-vocab-term">{vocab.term}</strong>
                      <span className="reading-vocab-trans">{vocab.transcription}</span>
                    </div>

                    <button
                      type="button"
                      className={`reading-vocab-listen-btn ${isPlayingVocab ? 'active' : ''}`}
                      onClick={() => handleSpeakTerm(vocab)}
                      title={lang === 'en' ? 'Listen pronunciation' : 'Послушать произношение'}
                      aria-label={`Озвучить ${vocab.term}`}
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  <p className="reading-vocab-ru">{vocab.translation}</p>
                  <p className="reading-vocab-note">{vocab.contextNote}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Takeaway / Insight Banner */}
        <div className="reading-takeaway-card">
          <div className="reading-takeaway-icon">
            <Flame size={20} />
          </div>
          <div className="reading-takeaway-content">
            <h4>{lang === 'en' ? 'Core Insight' : 'Главный инсайт текста'}</h4>
            <p>{selectedArticle.takeawayRu}</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Article Catalog / List Screen ---
  return (
    <div className="reading-catalog-view">
      {/* Category Pills */}
      <div className="reading-cat-tabs" role="tablist" aria-label="Категории статей">
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          {lang === 'en' ? 'All topics' : 'Все темы'} ({READING_ARTICLES.length})
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'youtube' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('youtube')}
        >
          🎬 {lang === 'en' ? 'YouTube & Science' : 'YouTube и наука'}
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'press' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('press')}
        >
          📰 {lang === 'en' ? 'WSJ & Bloomberg' : 'Пресса WSJ / Bloomberg'}
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'tech' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('tech')}
        >
          🚀 {lang === 'en' ? 'Silicon Valley Startups' : 'Кремниевая долина'}
        </button>
      </div>

      {/* Articles Grid */}
      <div className="reading-articles-grid">
        {filteredArticles.map((article) => {
          return (
            <article key={article.id} className="reading-card" onClick={() => setSelectedArticleId(article.id)}>
              <div className="reading-card-head">
                <span className="reading-category-pill">
                  <Sparkles size={12} />
                  {lang === 'en' ? article.categoryLabel : article.categoryLabelRu}
                </span>
                <span className="reading-level-badge">{article.level}</span>
              </div>

              <h3 className="reading-card-title">{article.title}</h3>
              <p className="reading-card-title-ru">{article.titleRu}</p>

              <p className="reading-card-subtitle">{article.subtitle}</p>

              <div className="reading-card-footer">
                <span className="reading-card-time">
                  <Clock size={13} /> {article.readMinutes} {lang === 'en' ? 'min read' : 'мин чтения'} · {article.paragraphs.length}{' '}
                  {lang === 'en' ? 'paragraphs' : 'абзаца'}
                </span>

                <button
                  type="button"
                  className="reading-open-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedArticleId(article.id)
                  }}
                >
                  <span>{lang === 'en' ? 'Read with audio' : 'Читать с озвучкой'}</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { ArrowLeft, BookOpen, Clock, ExternalLink, Flame, Languages, Pause, Play, Sparkles, Square, Type, Volume2 } from 'lucide-react'
import { useSpeechSynthesis } from '../../../../hooks'
import { useTranslation } from '../../../../lib/i18n'
import { READING_ARTICLES, type ReadingArticle, type ReadingParagraph, type ReadingVocabularyItem } from './readingData'

export const EnglishReadingView = () => {
  const { lang, t } = useTranslation()
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

  if (selectedArticle) {
    const isPlayingFull = playingId === `full-${selectedArticle.id}`

    return (
      <div className="reading-article-view">
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
            <span>{t('lang.reading.allArticles')}</span>
          </button>

          <div className="reading-settings-controls">
            <div className="reading-font-toggle" title={t('lang.reading.fontSize')}>
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

            <button
              type="button"
              className={`reading-toggle-trans-btn ${showAllTranslations ? 'is-active' : ''}`}
              onClick={() => setShowAllTranslations((prev) => !prev)}
            >
              <Languages size={15} />
              <span className="trans-btn-full">
                {showAllTranslations ? t('lang.reading.hideTranslation') : t('lang.reading.showTranslation')}
              </span>
              <span className="trans-btn-short">{showAllTranslations ? t('lang.reading.hideShort') : t('lang.reading.showShort')}</span>
            </button>
          </div>
        </div>

        <header className="reading-article-header">
          <div className="reading-article-meta-row">
            <span className="reading-category-pill">
              <Sparkles size={12} />
              {lang === 'en' ? selectedArticle.categoryLabel : selectedArticle.categoryLabelRu}
            </span>
            <span className="reading-level-badge">{selectedArticle.level}</span>
            <span className="reading-time-tag">
              <Clock size={13} /> {t('lang.reading.minRead', undefined, { count: selectedArticle.readMinutes })}
            </span>
          </div>

          <h2 className="reading-article-title">{selectedArticle.title}</h2>
          <p className="reading-article-title-ru">{selectedArticle.titleRu}</p>
          <p className="reading-article-subtitle">{selectedArticle.subtitle}</p>

          <div className="reading-audio-bar">
            <button
              type="button"
              className={`reading-audio-play-btn ${isPlayingFull ? 'is-playing' : ''}`}
              onClick={() => handlePlayFullArticle(selectedArticle)}
            >
              {isPlayingFull && isSpeaking && !isPaused ? (
                <>
                  <Pause size={16} /> {t('lang.reading.pause')}
                </>
              ) : isPlayingFull && isPaused ? (
                <>
                  <Play size={16} /> {t('lang.reading.resume')}
                </>
              ) : (
                <>
                  <Volume2 size={16} /> {t('lang.reading.listenFull')}
                </>
              )}
            </button>

            {isPlayingFull && (
              <button type="button" className="reading-audio-stop-btn" onClick={cancel} title={t('lang.reading.stop')}>
                <Square size={14} />
              </button>
            )}

            <span className="reading-audio-hint">{t('lang.reading.ttsHint')}</span>
          </div>
        </header>

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
                      title={t('lang.reading.listenParagraph')}
                      aria-label={t('lang.reading.paragraphAria', undefined, { index: index + 1 })}
                    >
                      <Volume2 size={14} />
                      <span>{isPlayingThis ? t('lang.reading.playing') : t('lang.reading.listen')}</span>
                    </button>

                    <button
                      type="button"
                      className={`reading-para-btn ${isRevealed ? 'is-active' : ''}`}
                      onClick={() => toggleParagraphTranslation(paragraph.id)}
                      title={t('lang.reading.toggleTranslation')}
                    >
                      <Languages size={14} />
                      <span>{isRevealed ? t('lang.reading.hideShort') : t('lang.reading.translateShort')}</span>
                    </button>
                  </div>
                </div>

                <p className="reading-paragraph-text-en">{paragraph.en}</p>

                {isRevealed && (
                  <div className="reading-paragraph-text-ru">
                    <p>{paragraph.ru}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <section className="reading-vocab-section">
          <div className="reading-vocab-head">
            <div className="reading-vocab-badge">
              <BookOpen size={14} />
              <span>{t('lang.reading.keyVocab')}</span>
            </div>
            <h3>{t('lang.reading.advancedPhrasing')}</h3>
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
                      title={t('lang.reading.listenPronunciation')}
                      aria-label={t('lang.reading.termAria', undefined, { term: vocab.term })}
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

        <div className="reading-takeaway-card">
          <div className="reading-takeaway-icon">
            <Flame size={20} />
          </div>
          <div className="reading-takeaway-content">
            <h4>{t('lang.reading.coreInsight')}</h4>
            <p>{selectedArticle.takeawayRu}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reading-catalog-view">
      <div className="reading-cat-tabs" role="tablist" aria-label={t('lang.reading.catsAria')}>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          {t('lang.reading.allTopics')} ({READING_ARTICLES.length})
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'youtube' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('youtube')}
        >
          🎬 {t('lang.reading.catYoutube')}
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'press' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('press')}
        >
          📰 {t('lang.reading.catPress')}
        </button>
        <button
          type="button"
          className={`reading-cat-tab ${selectedCategory === 'tech' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('tech')}
        >
          🚀 {t('lang.reading.catTech')}
        </button>
      </div>

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
                  <Clock size={13} /> {t('lang.reading.minRead', undefined, { count: article.readMinutes })} ·{' '}
                  {t('lang.reading.paragraphs', undefined, { count: article.paragraphs.length })}
                </span>

                <button
                  type="button"
                  className="reading-open-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedArticleId(article.id)
                  }}
                >
                  <span>{t('lang.reading.readWithAudio')}</span>
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

import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Sparkles, Wand2 } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { NoteKind } from '../../../store'
import { getSnippetsForKind, type SnippetLength } from '../notesSnippets'
import './NotesSnippetsAccordion.css'

type NotesSnippetsAccordionProps = {
  kind: NoteKind
  onInsert: (text: string) => void
  isSimple?: boolean
}

export const NotesSnippetsAccordion = ({ kind, onInsert, isSimple = false }: NotesSnippetsAccordionProps) => {
  const { lang, t } = useTranslation()
  const sections = getSnippetsForKind(kind, lang)

  const [openSections, setOpenSections] = useState<Record<SnippetLength, boolean>>({
    short: !isSimple,
    medium: false,
    long: false,
  })

  const [insertedId, setInsertedId] = useState<string | null>(null)

  const toggleSection = (length: SnippetLength) => {
    setOpenSections((prev) => ({
      ...prev,
      [length]: !prev[length],
    }))
  }

  const handleSnippetClick = (id: string, text: string) => {
    onInsert(text)
    setInsertedId(id)
    setTimeout(() => {
      setInsertedId((curr) => (curr === id ? null : curr))
    }, 1200)
  }

  return (
    <div className={`notes-accordion ${isSimple ? 'is-simple' : ''}`}>
      <div className="notes-accordion-header">
        <div className="notes-accordion-title">
          <Sparkles size={14} className="notes-accordion-icon" />
          <span>
            {kind === 'dream'
              ? lang === 'en'
                ? 'Dream Builders & AI Prompts'
                : 'Конструктор снов & ИИ-шаблоны'
              : lang === 'en'
                ? 'Quick Builders & Templates'
                : 'Быстрые заготовки & шаблоны'}
          </span>
        </div>
        <span className="notes-accordion-badge">
          {kind === 'dream'
            ? lang === 'en'
              ? 'tap to write fast'
              : 'в 1 клик для ленивых'
            : lang === 'en'
              ? 'instant insert'
              : 'клик для вставки'}
        </span>
      </div>

      <div className="notes-accordion-sections">
        {sections.map((section) => {
          const isOpen = openSections[section.length]
          return (
            <div key={section.length} className={`snippet-group ${isOpen ? 'is-open' : ''}`}>
              <button type="button" className="snippet-group-trigger" onClick={() => toggleSection(section.length)} aria-expanded={isOpen}>
                <div className="snippet-group-left">
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="snippet-group-name">{section.title}</span>
                  <span className="snippet-group-count">{section.items.length}</span>
                </div>
                <span className="snippet-group-hint">{section.hint}</span>
              </button>

              {isOpen && (
                <div className="snippet-group-content">
                  {section.length === 'short' && (
                    <div className="snippet-chips">
                      {section.items.map((item) => {
                        const isJustInserted = insertedId === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`snippet-chip ${isJustInserted ? 'is-inserted' : ''}`}
                            onClick={() => handleSnippetClick(item.id, item.text)}
                            title={item.text}
                          >
                            {isJustInserted ? <Check size={12} /> : null}
                            <span>{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {section.length === 'medium' && (
                    <div className="snippet-cards-medium">
                      {section.items.map((item) => {
                        const isJustInserted = insertedId === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`snippet-card-medium ${isJustInserted ? 'is-inserted' : ''}`}
                            onClick={() => handleSnippetClick(item.id, item.text)}
                          >
                            <div className="snippet-card-head">
                              <span className="snippet-card-label">{item.label}</span>
                              {isJustInserted ? (
                                <span className="snippet-card-status">
                                  <Check size={12} /> {t('notes.copied') || 'Вставлено'}
                                </span>
                              ) : (
                                <span className="snippet-card-action">
                                  <Wand2 size={11} /> +
                                </span>
                              )}
                            </div>
                            <p className="snippet-card-text">{item.text.trim()}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {section.length === 'long' && (
                    <div className="snippet-cards-long">
                      {section.items.map((item) => {
                        const isJustInserted = insertedId === item.id
                        return (
                          <div key={item.id} className="snippet-card-long">
                            <div className="snippet-card-long-head">
                              <div>
                                <h4 className="snippet-card-long-title">{item.label}</h4>
                              </div>
                              <button
                                type="button"
                                className={`snippet-insert-btn ${isJustInserted ? 'is-inserted' : ''}`}
                                onClick={() => handleSnippetClick(item.id, item.text)}
                              >
                                {isJustInserted ? (
                                  <>
                                    <Check size={13} /> {lang === 'en' ? 'Inserted!' : 'Вставлено!'}
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={13} /> {lang === 'en' ? 'Insert template' : 'Вставить шаблон'}
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="snippet-card-long-preview">{item.text.slice(0, 220)}…</pre>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

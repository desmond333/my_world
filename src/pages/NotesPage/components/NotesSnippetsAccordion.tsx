import { useState } from 'react'
import { Check, Sparkles, Wand2 } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { NoteKind } from '../../../store'
import { getSnippetsForKind } from '../notesSnippets'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../shared/ui'
import './NotesSnippetsAccordion.css'

type NotesSnippetsAccordionProps = {
  kind: NoteKind
  onInsert: (text: string) => void
  isSimple?: boolean
}

export const NotesSnippetsAccordion = ({ kind, onInsert, isSimple = false }: NotesSnippetsAccordionProps) => {
  const { lang, t } = useTranslation()
  const sections = getSnippetsForKind(kind, lang)

  const [insertedId, setInsertedId] = useState<string | null>(null)

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
          <span>{kind === 'dream' ? t('notes.accordion.dreamTitle') : t('notes.accordion.notesTitle')}</span>
        </div>
        <span className="notes-accordion-badge">{kind === 'dream' ? t('notes.accordion.dreamHint') : t('notes.accordion.notesHint')}</span>
      </div>

      <Accordion type="multiple" defaultValue={!isSimple ? ['short'] : []} className="notes-accordion-sections">
        {sections.map((section) => (
          <AccordionItem key={section.length} value={section.length} className="snippet-group">
            <AccordionTrigger className="snippet-group-trigger">
              <div className="snippet-group-left">
                <span className="snippet-group-name">{section.title}</span>
                <span className="snippet-group-count">{section.items.length}</span>
              </div>
              <span className="snippet-group-hint">{section.hint}</span>
            </AccordionTrigger>

            <AccordionContent className="snippet-group-content">
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
                                <Check size={13} /> {t('notes.accordion.inserted')}
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} /> {t('notes.accordion.insert')}
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

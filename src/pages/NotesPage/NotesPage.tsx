import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, FileText, Moon, NotebookPen, PenTool, Plus, Sparkles, Trash2 } from 'lucide-react'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import { useTranslation } from '../../lib/i18n'
import type { Note, NoteKind, NotePatch } from '../../store'
import { useNotesStore, usePageViewMode } from '../../store'
import { NotesSnippetsAccordion } from './components/NotesSnippetsAccordion'
import { DreamFriendGreeting } from './components/DreamFriendGreeting'
import './NotesPage.css'

const AUTOSAVE_MS = 600

type NoteEditorProps = {
  note: Note
  onChange: (id: string, patch: NotePatch) => void
  onDelete: () => void
  isSimple: boolean
}

const NoteEditor = ({ note, onChange, onDelete, isSimple }: NoteEditorProps) => {
  const { t, locale } = useTranslation()
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  const [saved, setSaved] = useState(true)
  const [copied, setCopied] = useState(false)
  const [snippetsOpen, setSnippetsOpen] = useState(!isSimple)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onChange(note.id, { title, body })
      setSaved(true)
    }, AUTOSAVE_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [title, body, note.id, onChange])

  const markDirty = () => {
    if (saved) setSaved(false)
  }

  const handleCopyNote = async () => {
    const textToCopy = title.trim() ? `${title.trim()}\n\n${body.trim()}` : body.trim()
    if (!textToCopy) return
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleInsertSnippet = (snippetText: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = body.slice(0, start)
      const after = body.slice(end)
      const spacerBefore = before.length > 0 && !before.endsWith('\n') ? '\n' : ''
      const newBody = `${before}${spacerBefore}${snippetText}${after}`
      setBody(newBody)
      markDirty()
      onChange(note.id, { title, body: newBody })
      requestAnimationFrame(() => {
        textarea.focus()
        const newPos = start + spacerBefore.length + snippetText.length
        textarea.setSelectionRange(newPos, newPos)
      })
    } else {
      const spacer = body.trim().length > 0 ? '\n\n' : ''
      const newBody = `${body}${spacer}${snippetText}`
      setBody(newBody)
      markDirty()
      onChange(note.id, { title, body: newBody })
    }
  }

  const wordCount = useMemo(() => {
    const clean = body.trim()
    return clean ? clean.split(/\s+/).length : 0
  }, [body])

  const charCount = body.length

  const stamp = new Date(note.updatedAt).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isDream = note.kind === 'dream'

  return (
    <>
      <div className="notes-editor-bar">
        <div className="notes-editor-left">
          <span className={`notes-save-state${saved ? ' is-saved' : ''}`}>
            {saved ? <Check size={13} /> : null} {saved ? t('notes.saved') : t('notes.saving')}
          </span>
          <span className="notes-updated">{stamp}</span>
          <span className="notes-stats">
            {wordCount} {t('notes.words')} · {charCount} {t('notes.chars')}
          </span>
        </div>

        <div className="notes-editor-actions">
          <button
            type="button"
            className={`notes-action-btn ${copied ? 'is-copied' : ''}`}
            onClick={handleCopyNote}
            title={t('notes.copy')}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? t('notes.copied') : t('notes.copy')}</span>
          </button>

          <button
            type="button"
            className={`notes-action-btn notes-snippets-toggle ${snippetsOpen ? 'is-active' : ''}`}
            onClick={() => setSnippetsOpen((prev) => !prev)}
            title={t('notes.snippetsToggle')}
          >
            <Sparkles size={13} />
            <span>{t('notes.snippetsToggle')}</span>
          </button>

          <button type="button" className="notes-delete" onClick={onDelete} title={t('notes.delete')}>
            <Trash2 size={14} />
            <span className="visually-hidden">{t('notes.delete')}</span>
          </button>
        </div>
      </div>

      <input
        type="text"
        className={`notes-title-input ${isDream ? 'is-dream' : ''}`}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          markDirty()
        }}
        placeholder={isDream ? t('notes.titlePlaceholder.dream') : t('notes.titlePlaceholder.note')}
      />

      <textarea
        ref={textareaRef}
        className={`notes-body ${isDream ? 'is-dream' : ''}`}
        value={body}
        onChange={(event) => {
          setBody(event.target.value)
          markDirty()
        }}
        placeholder={isDream ? t('notes.bodyPlaceholder.dream') : t('notes.bodyPlaceholder.note')}
      />

      {snippetsOpen && <NotesSnippetsAccordion kind={note.kind} onInsert={handleInsertSnippet} isSimple={isSimple} />}
    </>
  )
}

export type NotesPageProps = {
  fixedKind?: NoteKind
  hideTopbar?: boolean
}

export const NotesPage = ({ fixedKind, hideTopbar = false }: NotesPageProps = {}) => {
  const { t, locale, lang } = useTranslation()
  const { isSimple } = usePageViewMode('notes')
  const notes = useNotesStore((state) => state.notes)
  const add = useNotesStore((state) => state.add)
  const update = useNotesStore((state) => state.update)
  const remove = useNotesStore((state) => state.remove)

  const [userTab, setUserTab] = useState<NoteKind>('note')
  const activeTab = fixedKind ?? userTab
  const setActiveTab = setUserTab
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null)

  const filteredNotes = useMemo(() => notes.filter((note) => (note.kind ?? 'note') === activeTab), [notes, activeTab])

  const notesCount = useMemo(() => notes.filter((n) => (n.kind ?? 'note') === 'note').length, [notes])
  const dreamsCount = useMemo(() => notes.filter((n) => n.kind === 'dream').length, [notes])

  const resolvedActiveId = activeId && filteredNotes.some((n) => n.id === activeId) ? activeId : (filteredNotes[0]?.id ?? null)

  const active = useMemo(() => filteredNotes.find((note) => note.id === resolvedActiveId) ?? null, [filteredNotes, resolvedActiveId])

  const handleAdd = () => {
    const newId = add(activeTab)
    setActiveId(newId)
  }

  const handleDelete = () => {
    if (!active) return
    const index = filteredNotes.findIndex((note) => note.id === active.id)
    const rest = filteredNotes.filter((note) => note.id !== active.id)
    remove(active.id)
    setActiveId(rest[Math.min(index, rest.length - 1)]?.id ?? null)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 2400)
  }

  const handleCopySingleItem = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    const content = note.title.trim() ? `${note.title.trim()}\n\n${note.body.trim()}` : note.body.trim()
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopiedItemId(note.id)
      showToast(t('notes.copied'))
      setTimeout(() => {
        setCopiedItemId((curr) => (curr === note.id ? null : curr))
      }, 1800)
    } catch {
      // fallback
    }
  }

  const handleCopyAllForAI = async () => {
    if (filteredNotes.length === 0) return

    const isEn = lang === 'en'
    const headerTitle =
      activeTab === 'dream'
        ? isEn
          ? `🌙 DREAM DIARY (${filteredNotes.length} entries)`
          : `🌙 ДНЕВНИК СНОВ (${filteredNotes.length} записей)`
        : isEn
          ? `📝 NOTES COLLECTION (${filteredNotes.length} entries)`
          : `📝 СБОРНИК ЗАМЕТОК (${filteredNotes.length} записей)`

    const promptContext =
      activeTab === 'dream'
        ? isEn
          ? `*Context: Personal dream journal entries for psychological, symbolic, and pattern analysis with LLM.*`
          : `*Контекст: Записи личного дневника снов для психологического, символического анализа и поиска паттернов в ИИ.*`
        : isEn
          ? `*Context: Structured notes for review, summarization, and key insight extraction with LLM.*`
          : `*Контекст: Структурированные заметки для анализа, суммаризации и выделения ключевых выводов в ИИ.*`

    const itemsFormatted = filteredNotes
      .map((item, idx) => {
        const titleStr = item.title.trim() || (isEn ? 'Untitled' : 'Без названия')
        const dateStr = new Date(item.updatedAt).toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        const bodyStr = item.body.trim() || (isEn ? '(empty body)' : '(текст отсутствует)')

        return `### ${idx + 1}. ${titleStr}\n**${isEn ? 'Date' : 'Дата'}:** ${dateStr}\n\n${bodyStr}`
      })
      .join('\n\n---\n\n')

    const fullExport = `${headerTitle}\n${promptContext}\n\n---\n\n${itemsFormatted}\n`

    try {
      await navigator.clipboard.writeText(fullExport)
      showToast(t('notes.copyAllSuccess'))
    } catch {
      // fallback
    }
  }

  const preview = (text: string) =>
    text
      .replace(/[#*_>`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const isDream = activeTab === 'dream'

  return (
    <div className={hideTopbar ? 'notes-page-wrapper' : 'page-shell'}>
      {!hideTopbar && <AppTopbar />}

      <main className={`notes-page ${isDream ? 'theme-dream' : ''} ${hideTopbar ? 'is-embedded' : ''}`}>
        {toastMessage && (
          <div className="notes-toast" role="status" aria-live="polite">
            <Check size={14} />
            <span>{toastMessage}</span>
          </div>
        )}

        <header className="notes-head">
          <div className="notes-head-top">
            <p className="eyebrow">
              {isDream ? <Moon size={15} /> : <NotebookPen size={15} />}
              {isDream ? t('notes.kicker.dreams') : t('notes.kicker.notes')}
            </p>

            {!fixedKind && (
              <div className="notes-tabs">
                <button
                  type="button"
                  className={`notes-tab-btn ${activeTab === 'note' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('note')}
                >
                  <PenTool size={14} />
                  <span>{t('notes.tab.notes')}</span>
                  <span className="notes-tab-badge">{notesCount}</span>
                </button>

                <button
                  type="button"
                  className={`notes-tab-btn ${activeTab === 'dream' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('dream')}
                >
                  <Moon size={14} />
                  <span>{t('notes.tab.dreams')}</span>
                  <span className="notes-tab-badge">{dreamsCount}</span>
                </button>
              </div>
            )}
          </div>

          <h1>{isDream ? t('notes.title.dreams') : t('notes.title.notes')}</h1>
          <p className="intro">{isDream ? t('notes.intro.dreams') : t('notes.intro.notes')}</p>
        </header>

        <div className="notes-layout">
          <aside className="notes-side">
            {isDream && <DreamFriendGreeting onShowToast={showToast} />}

            <div className="notes-side-actions">
              <button type="button" className="add-button notes-add" onClick={handleAdd}>
                <Plus size={15} /> {isDream ? t('notes.new.dream') : t('notes.new.note')}
              </button>

              <button
                type="button"
                className="notes-copy-all-btn"
                onClick={handleCopyAllForAI}
                disabled={filteredNotes.length === 0}
                title={t('notes.copyAll')}
              >
                <Sparkles size={14} />
                <span>{t('notes.copyAllShort')}</span>
              </button>
            </div>

            {filteredNotes.length === 0 ? (
              <p className="notes-empty">
                <FileText size={18} /> {isDream ? t('notes.empty.dream') : t('notes.empty.note')}
              </p>
            ) : (
              <ul className="notes-list">
                {filteredNotes.map((note) => {
                  const isItemCopied = copiedItemId === note.id
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        className={`notes-item${note.id === resolvedActiveId ? ' is-on' : ''}`}
                        onClick={() => setActiveId(note.id)}
                      >
                        <div className="notes-item-header">
                          <span className="notes-item-title">{note.title.trim() || t('notes.untitled')}</span>
                          <button
                            type="button"
                            className={`notes-item-copy-btn ${isItemCopied ? 'is-copied' : ''}`}
                            onClick={(e) => handleCopySingleItem(e, note)}
                            title={t('notes.copy')}
                          >
                            {isItemCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <span className="notes-item-preview">{preview(note.body).slice(0, 75) || t('notes.untitled')}</span>
                        <span className="notes-item-date">
                          {new Date(note.updatedAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>

          <section className="notes-editor">
            {!active ? (
              <p className="notes-editor-empty">
                <NotebookPen size={22} /> {t('notes.pickFirst')}
              </p>
            ) : (
              <NoteEditor key={active.id} note={active} onChange={update} onDelete={handleDelete} isSimple={isSimple} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

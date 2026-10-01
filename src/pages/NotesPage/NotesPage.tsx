import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronRight,
  Copy,
  FileText,
  FolderInput,
  FolderTree,
  HelpCircle,
  LayoutGrid,
  Moon,
  NotebookPen,
  PenTool,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { AppTopbar } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import type { Note, NoteKind, NotePatch } from '../../store'
import { useNotesStore, usePageViewMode } from '../../store'
import { BlockEditor, blocksToPlainText, isBlockJson, parseBlocks, serializeBlocks } from '../../features'
import { getBreadcrumbs, getChildNotes } from '../../entities/note'
import { Tabs, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem, Tooltip } from '../../shared/ui'
import { NotesSnippetsAccordion } from './components/NotesSnippetsAccordion'
import { DreamFriendGreeting } from './components/DreamFriendGreeting'
import { NotesSidebarTree } from './components/NotesSidebarTree'
import { MoveNoteModal } from './components/MoveNoteModal'
import { NotesHelpModal } from './components/NotesHelpModal'
import './NotesPage.css'

const AUTOSAVE_MS = 600

type NoteEditorProps = {
  note: Note
  allNotes: Note[]
  onChange: (id: string, patch: NotePatch) => void
  onDelete: () => void
  onSelectNote: (id: string) => void
  onAddSubpage: (parentId: string) => void
  onMoveNote: (id: string, newParentId: string | null) => void
  onOpenHelp: () => void
  isSimple: boolean
}

const NoteEditor = ({
  note,
  allNotes,
  onChange,
  onDelete,
  onSelectNote,
  onAddSubpage,
  onMoveNote,
  onOpenHelp,
  isSimple,
}: NoteEditorProps) => {
  const { t, locale } = useTranslation()
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  const [editorMode, setEditorMode] = useState<'blocks' | 'text'>(note.kind === 'dream' ? 'text' : 'blocks')
  const [editorKey, setEditorKey] = useState(0)
  const [saved, setSaved] = useState(true)
  const [copied, setCopied] = useState(false)
  const [snippetsOpen, setSnippetsOpen] = useState(!isSimple)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const breadcrumbs = useMemo(() => getBreadcrumbs(allNotes, note.id), [allNotes, note.id])
  const subpages = useMemo(() => getChildNotes(allNotes, note.id), [allNotes, note.id])

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

  const textContent = useMemo(() => {
    return isBlockJson(body) ? blocksToPlainText(parseBlocks(body)) : body
  }, [body])

  const handleCopyNote = async () => {
    const textToCopy = title.trim() ? `${title.trim()}\n\n${textContent.trim()}` : textContent.trim()
    if (!textToCopy) return
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      void 0
    }
  }

  const handleInsertSnippet = (snippetText: string) => {
    if (editorMode === 'blocks') {
      const currentBlocks = parseBlocks(body)
      const snippetBlocks = parseBlocks(snippetText)
      const combined = [...currentBlocks, ...snippetBlocks]
      const newBody = serializeBlocks(combined)
      setBody(newBody)
      setEditorKey((k) => k + 1)
      markDirty()
      onChange(note.id, { title, body: newBody })
    } else {
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
  }

  const wordCount = useMemo(() => {
    const clean = textContent.trim()
    return clean ? clean.split(/\s+/).length : 0
  }, [textContent])

  const charCount = textContent.length

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
          <ToggleGroup
            type="single"
            value={editorMode}
            onValueChange={(val) => {
              if (!val) return
              if (val === 'blocks' && editorMode !== 'blocks') {
                const nextBody = serializeBlocks(parseBlocks(body))
                setBody(nextBody)
                setEditorMode('blocks')
                markDirty()
              } else if (val === 'text' && editorMode !== 'text') {
                const nextBody = isBlockJson(body) ? blocksToPlainText(parseBlocks(body)) : body
                setBody(nextBody)
                setEditorMode('text')
                markDirty()
              }
            }}
            className="notes-mode-toggle"
            aria-label="Режим редактора"
          >
            <Tooltip content="Блочный редактор">
              <ToggleGroupItem
                value="blocks"
                className={`notes-mode-btn ${editorMode === 'blocks' ? 'is-active' : ''}`}
                aria-label="Блочный редактор"
              >
                <LayoutGrid size={13} />
                <span>Блоки</span>
              </ToggleGroupItem>
            </Tooltip>
            <Tooltip content="Текстовый режим">
              <ToggleGroupItem
                value="text"
                className={`notes-mode-btn ${editorMode === 'text' ? 'is-active' : ''}`}
                aria-label="Текстовый режим"
              >
                <FileText size={13} />
                <span>Текст</span>
              </ToggleGroupItem>
            </Tooltip>
          </ToggleGroup>

          <Tooltip content={t('notes.copy')}>
            <button
              type="button"
              className={`notes-action-btn ${copied ? 'is-copied' : ''}`}
              onClick={handleCopyNote}
              aria-label={t('notes.copy')}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? t('notes.copied') : t('notes.copy')}</span>
            </button>
          </Tooltip>

          <Tooltip content={t('notes.snippetsToggle')}>
            <button
              type="button"
              className={`notes-action-btn notes-snippets-toggle ${snippetsOpen ? 'is-active' : ''}`}
              onClick={() => setSnippetsOpen((prev) => !prev)}
              aria-label={t('notes.snippetsToggle')}
            >
              <Sparkles size={13} />
              <span>{t('notes.snippetsToggle')}</span>
            </button>
          </Tooltip>

          <Tooltip content={t('notes.help.title')}>
            <button type="button" className="notes-action-btn notes-help-toggle" onClick={onOpenHelp} aria-label={t('notes.help.title')}>
              <HelpCircle size={13} />
              <span>{t('notes.help.button')}</span>
            </button>
          </Tooltip>

          <Tooltip content={t('notes.delete')}>
            <button type="button" className="notes-delete" onClick={onDelete} aria-label={t('notes.delete')}>
              <Trash2 size={14} />
              <span className="visually-hidden">{t('notes.delete')}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {!isDream && (
        <div className="notes-breadcrumbs-bar">
          <nav className="notes-breadcrumbs" aria-label="Путь к странице">
            <button
              type="button"
              className="notes-crumb-btn notes-crumb-root-label"
              onClick={() => {
                const root = breadcrumbs[0]
                if (root && root.id !== note.id) onSelectNote(root.id)
              }}
              title={t('notes.tree.allPages')}
            >
              {isDream ? <Moon size={12} /> : <FileText size={12} />}
              <span>{isDream ? t('notes.tab.dreams') : t('notes.tab.notes')}</span>
            </button>
            {breadcrumbs.slice(0, -1).map((crumb) => (
              <span key={crumb.id} className="notes-crumb-segment">
                <ChevronRight size={11} className="notes-crumb-sep" />
                <button
                  type="button"
                  className="notes-crumb-btn"
                  onClick={() => onSelectNote(crumb.id)}
                  title={crumb.title || t('notes.untitled')}
                >
                  {crumb.title.trim() || t('notes.untitled')}
                </button>
              </span>
            ))}
            <span className="notes-crumb-segment">
              <ChevronRight size={11} className="notes-crumb-sep" />
              <span className="notes-crumb-current">{title.trim() || t('notes.untitled')}</span>
            </span>
          </nav>

          <div className="notes-breadcrumbs-actions">
            <button
              type="button"
              className="notes-crumb-action-btn"
              onClick={() => onAddSubpage(note.id)}
              title={t('notes.tree.addSubpage')}
            >
              <Plus size={12} />
              <span>{t('notes.tree.subpage')}</span>
            </button>
            {!isSimple && (
              <button type="button" className="notes-crumb-action-btn" onClick={() => setMoveModalOpen(true)} title={t('notes.tree.move')}>
                <FolderInput size={12} />
                <span>{t('notes.tree.move')}</span>
              </button>
            )}
          </div>
        </div>
      )}

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

      {editorMode === 'blocks' ? (
        <BlockEditor
          key={editorKey}
          initialContent={body}
          onChange={(newBody) => {
            setBody(newBody)
            markDirty()
          }}
          isSimple={isSimple}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className={`notes-body ${isDream ? 'is-dream' : ''}`}
          value={isBlockJson(body) ? blocksToPlainText(parseBlocks(body)) : body}
          onChange={(event) => {
            setBody(event.target.value)
            markDirty()
          }}
          placeholder={isDream ? t('notes.bodyPlaceholder.dream') : t('notes.bodyPlaceholder.note')}
        />
      )}

      {!isDream && (
        <div className={`notes-subpages-section ${isSimple ? 'is-simple' : ''}`}>
          <div className="notes-subpages-head">
            <span className="notes-subpages-title">
              <FolderTree size={14} />
              <span>{t('notes.tree.subpages')}</span>
              {subpages.length > 0 && <span className="notes-subpages-badge">{subpages.length}</span>}
            </span>
            <button type="button" className="notes-add-subpage-btn" onClick={() => onAddSubpage(note.id)}>
              <Plus size={12} />
              <span>{t('notes.tree.addSubpage')}</span>
            </button>
          </div>

          {subpages.length === 0 ? (
            !isSimple && (
              <div className="notes-subpages-empty">
                <p>{t('notes.tree.noSubpagesHint')}</p>
              </div>
            )
          ) : (
            <div className="notes-subpages-grid">
              {subpages.map((child) => (
                <button key={child.id} type="button" className="notes-subpage-card" onClick={() => onSelectNote(child.id)}>
                  <span className="notes-subpage-card-icon">{isDream ? <Moon size={14} /> : <FileText size={14} />}</span>
                  <span className="notes-subpage-card-title">{child.title.trim() || t('notes.untitled')}</span>
                  <ChevronRight size={13} className="notes-subpage-card-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isDream && moveModalOpen && (
        <MoveNoteModal
          isOpen={moveModalOpen}
          noteId={note.id}
          notes={allNotes}
          onClose={() => setMoveModalOpen(false)}
          onMove={onMoveNote}
        />
      )}

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
  const move = useNotesStore((state) => state.move)

  const [userTab, setUserTab] = useState<NoteKind>('note')
  const activeTab = fixedKind ?? userTab
  const setActiveTab = setUserTab
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  const filteredNotes = useMemo(() => notes.filter((note) => (note.kind ?? 'note') === activeTab), [notes, activeTab])

  const { notesCount, dreamsCount } = useMemo(() => {
    let n = 0
    let d = 0
    for (const note of notes) {
      if (note.kind === 'dream') d++
      else n++
    }
    return { notesCount: n, dreamsCount: d }
  }, [notes])

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
        const plain = isBlockJson(item.body) ? blocksToPlainText(parseBlocks(item.body)) : item.body
        const bodyStr = plain.trim() || (isEn ? '(empty body)' : '(текст отсутствует)')

        return `### ${idx + 1}. ${titleStr}\n**${isEn ? 'Date' : 'Дата'}:** ${dateStr}\n\n${bodyStr}`
      })
      .join('\n\n---\n\n')

    const fullExport = `${headerTitle}\n${promptContext}\n\n---\n\n${itemsFormatted}\n`

    try {
      await navigator.clipboard.writeText(fullExport)
      showToast(t('notes.copyAllSuccess'))
    } catch {
      void 0
    }
  }

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

            <div className="notes-head-controls">
              {!fixedKind && (
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as NoteKind)}>
                  <TabsList className="notes-tabs" aria-label={t('notes.tab.notes')}>
                    <TabsTrigger value="note" className={`notes-tab-btn ${activeTab === 'note' ? 'is-active' : ''}`}>
                      <PenTool size={14} />
                      <span>{t('notes.tab.notes')}</span>
                      <span className="notes-tab-badge">{notesCount}</span>
                    </TabsTrigger>

                    <TabsTrigger value="dream" className={`notes-tab-btn ${activeTab === 'dream' ? 'is-active' : ''}`}>
                      <Moon size={14} />
                      <span>{t('notes.tab.dreams')}</span>
                      <span className="notes-tab-badge">{dreamsCount}</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <Tooltip content={t('notes.help.title')}>
                <button type="button" className="notes-help-top-btn" onClick={() => setHelpOpen(true)} aria-label={t('notes.help.title')}>
                  <HelpCircle size={14} />
                  <span>{t('notes.help.button')}</span>
                </button>
              </Tooltip>
            </div>
          </div>

          <h1>{isDream ? t('notes.title.dreams') : t('notes.title.notes')}</h1>
          <p className="intro">{isDream ? t('notes.intro.dreams') : t('notes.intro.notes')}</p>
        </header>

        <div className="notes-layout">
          <aside className="notes-side">
            {isDream && <DreamFriendGreeting onShowToast={showToast} />}

            <NotesSidebarTree
              notes={filteredNotes}
              activeId={resolvedActiveId}
              onSelect={(id) => setActiveId(id)}
              onAddRoot={handleAdd}
              onAddChild={(parentId) => {
                const newId = add(activeTab, { parentId })
                setActiveId(newId)
              }}
              onDelete={(id) => {
                remove(id)
                if (activeId === id) setActiveId(null)
              }}
              onMove={(id, targetParentId) => move(id, targetParentId)}
              onCopyAll={handleCopyAllForAI}
              isSimple={isSimple}
              isDream={isDream}
            />
          </aside>

          <section className="notes-editor">
            {!active ? (
              <p className="notes-editor-empty">
                <NotebookPen size={22} /> {t('notes.pickFirst')}
              </p>
            ) : (
              <NoteEditor
                key={active.id}
                note={active}
                allNotes={filteredNotes}
                onChange={update}
                onDelete={handleDelete}
                onSelectNote={(id) => setActiveId(id)}
                onAddSubpage={(parentId) => {
                  const newId = add(activeTab, { parentId })
                  setActiveId(newId)
                }}
                onMoveNote={(id, targetParentId) => move(id, targetParentId)}
                onOpenHelp={() => setHelpOpen(true)}
                isSimple={isSimple}
              />
            )}
          </section>
        </div>
      </main>

      <NotesHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

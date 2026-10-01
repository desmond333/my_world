import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  FolderInput,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import type { Note } from '../../../store'
import { buildNoteTree, getBreadcrumbs, searchTree, type NoteTreeNode } from '../../../entities/note'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '../../../shared/ui'
import { MoveNoteModal } from './MoveNoteModal'
import './NotesSidebarTree.css'

export type NotesSidebarTreeProps = {
  notes: Note[]
  activeId: string | null
  onSelect: (id: string) => void
  onAddRoot: () => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, newParentId: string | null) => void
  onCopyAll: () => void
  isSimple: boolean
  isDream?: boolean
}

const STORAGE_EXPANDED_KEY = 'animal-notes-tree-expanded'

const loadExpandedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_EXPANDED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

const saveExpandedIds = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_EXPANDED_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    void 0
  }
}

export const NotesSidebarTree = ({
  notes,
  activeId,
  onSelect,
  onAddRoot,
  onAddChild,
  onDelete,
  onMove,
  onCopyAll,
  isSimple,
  isDream = false,
}: NotesSidebarTreeProps) => {
  const { t, locale } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => loadExpandedIds())
  const [movingNoteId, setMovingNoteId] = useState<string | null>(null)

  const dreamList = useMemo(() => {
    if (!isDream) return []
    const q = searchQuery.trim().toLowerCase()
    const sorted = [...notes].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
    if (!q) return sorted
    return sorted.filter((d) => d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q))
  }, [isDream, notes, searchQuery])

  const fullTree = useMemo(() => buildNoteTree(notes), [notes])

  const effectiveExpandedIds = useMemo(() => {
    const combined = new Set(expandedIds)
    if (activeId) {
      const trail = getBreadcrumbs(notes, activeId)
      trail.slice(0, -1).forEach((n) => combined.add(n.id))
    }
    if (searchQuery.trim()) {
      const result = searchTree(fullTree, searchQuery)
      result.expandedIds.forEach((id) => combined.add(id))
    }
    return combined
  }, [expandedIds, activeId, notes, searchQuery, fullTree])

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return fullTree
    return searchTree(fullTree, searchQuery).filtered
  }, [fullTree, searchQuery])

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveExpandedIds(next)
      return next
    })
  }

  const handleExpandAll = () => {
    const allIds = new Set<string>()
    const collect = (nodes: NoteTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children.length > 0) {
          allIds.add(n.id)
          collect(n.children)
        }
      })
    }
    collect(fullTree)
    setExpandedIds(allIds)
    saveExpandedIds(allIds)
  }

  const handleCollapseAll = () => {
    const empty = new Set<string>()
    setExpandedIds(empty)
    saveExpandedIds(empty)
  }

  const handleCreateChild = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedIds((prev) => {
      const next = new Set(prev).add(parentId)
      saveExpandedIds(next)
      return next
    })
    onAddChild(parentId)
  }

  const handleDeleteWithPrompt = (node: NoteTreeNode, e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.children.length > 0) {
      const ok = window.confirm(t('notes.tree.deleteConfirm'))
      if (!ok) return
    }
    onDelete(node.id)
  }

  const handleOpenMove = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMovingNoteId(nodeId)
  }

  const renderNode = (node: NoteTreeNode) => {
    const hasChildren = node.children.length > 0
    const isExpanded = effectiveExpandedIds.has(node.id)
    const isActive = node.id === activeId

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-node-row ${isActive ? 'is-active' : ''}`}
          style={{ paddingLeft: `${node.depth * 14 + 6}px` }}
          onClick={() => onSelect(node.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(node.id)
            }
          }}
        >
          <div className="tree-node-expand-zone">
            {hasChildren ? (
              <button
                type="button"
                className="tree-chevron-btn"
                onClick={(e) => toggleExpand(node.id, e)}
                aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="tree-leaf-spacer" />
            )}
          </div>

          <span className="tree-node-icon">{isDream ? <Moon size={14} /> : <FileText size={14} />}</span>

          <span className="tree-node-title" title={node.title || t('notes.untitled')}>
            {node.title.trim() || t('notes.untitled')}
          </span>

          {!isSimple && hasChildren && <span className="tree-node-badge">{node.children.length}</span>}

          <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
            <Tooltip content={t('notes.tree.addSubpage')}>
              <button
                type="button"
                className="tree-action-btn"
                onClick={(e) => handleCreateChild(node.id, e)}
                aria-label={t('notes.tree.addSubpage')}
              >
                <Plus size={13} />
              </button>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="tree-action-btn" aria-label="Опции страницы">
                  <MoreHorizontal size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem onClick={(e) => handleCreateChild(node.id, e as unknown as React.MouseEvent)}>
                  <Plus size={13} /> {t('notes.tree.addSubpage')}
                </DropdownMenuItem>
                {!isSimple && (
                  <DropdownMenuItem onClick={(e) => handleOpenMove(node.id, e as unknown as React.MouseEvent)}>
                    <FolderInput size={13} /> {t('notes.tree.move')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="is-danger" onClick={(e) => handleDeleteWithPrompt(node, e as unknown as React.MouseEvent)}>
                  <Trash2 size={13} /> {t('notes.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-node-children" style={{ marginLeft: `${node.depth * 14 + 12}px` }}>
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="notes-sidebar-tree">
      <div className="notes-tree-top">
        <div className="notes-tree-actions-row">
          <button type="button" className="add-button notes-tree-add-btn" onClick={onAddRoot}>
            <Plus size={15} /> {isDream ? t('notes.new.dream') : t('notes.new.note')}
          </button>

          <Tooltip content={t('notes.copyAll')}>
            <button
              type="button"
              className="notes-tree-icon-btn"
              onClick={onCopyAll}
              disabled={notes.length === 0}
              aria-label={t('notes.copyAll')}
            >
              <Sparkles size={14} />
            </button>
          </Tooltip>

          {!isDream && !isSimple && notes.length > 0 && (
            <Tooltip content={expandedIds.size > 0 ? t('notes.tree.collapseAll') : t('notes.tree.expandAll')}>
              <button
                type="button"
                className="notes-tree-icon-btn"
                onClick={expandedIds.size > 0 ? handleCollapseAll : handleExpandAll}
                aria-label={expandedIds.size > 0 ? t('notes.tree.collapseAll') : t('notes.tree.expandAll')}
              >
                {expandedIds.size > 0 ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
              </button>
            </Tooltip>
          )}
        </div>

        {!isSimple && (
          <div className="notes-tree-search-bar">
            <Search size={13} className="notes-tree-search-icon" />
            <input
              type="text"
              className="notes-tree-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('notes.tree.search')}
            />
            {searchQuery && (
              <button type="button" className="notes-tree-search-clear" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="notes-tree-scroll">
        {notes.length === 0 ? (
          <p className="notes-empty">
            {isDream ? <Moon size={18} /> : <FileText size={18} />} {isDream ? t('notes.empty.dream') : t('notes.empty.note')}
          </p>
        ) : isDream ? (
          dreamList.length === 0 ? (
            <p className="notes-tree-no-match">{searchQuery ? t('notes.tree.searchEmpty') : t('notes.empty.dream')}</p>
          ) : (
            <div className="notes-dream-list">
              {dreamList.map((dream) => {
                const isActive = dream.id === activeId
                const dateStr = new Date(dream.updatedAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'short',
                })
                return (
                  <div
                    key={dream.id}
                    className={`tree-node-row is-dream-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => onSelect(dream.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect(dream.id)
                      }
                    }}
                  >
                    <span className="tree-node-icon">
                      <Moon size={14} />
                    </span>
                    <div className="tree-dream-info">
                      <span className="tree-node-title">{dream.title.trim() || t('notes.untitled')}</span>
                      <span className="tree-dream-date">{dateStr}</span>
                    </div>
                    <div className="tree-node-actions">
                      <button
                        type="button"
                        className="tree-action-btn is-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(dream.id)
                        }}
                        title={t('notes.delete')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : filteredTree.length === 0 ? (
          <p className="notes-tree-no-match">{t('notes.tree.searchEmpty')}</p>
        ) : (
          <div className="notes-tree-root">{filteredTree.map(renderNode)}</div>
        )}
      </div>

      {!isDream && movingNoteId && (
        <MoveNoteModal
          isOpen={Boolean(movingNoteId)}
          noteId={movingNoteId}
          notes={notes}
          onClose={() => setMovingNoteId(null)}
          onMove={onMove}
        />
      )}
    </div>
  )
}

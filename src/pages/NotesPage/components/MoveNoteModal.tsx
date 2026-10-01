import { useMemo, useState } from 'react'
import { FolderRoot, FolderTree } from 'lucide-react'
import { Button, Modal } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import type { Note } from '../../../store'
import { buildNoteTree, getAllDescendantIds, type NoteTreeNode } from '../../../entities/note'

export type MoveNoteModalProps = {
  isOpen: boolean
  onClose: () => void
  noteId: string
  notes: Note[]
  onMove: (noteId: string, targetParentId: string | null) => void
}

export const MoveNoteModal = ({ isOpen, onClose, noteId, notes, onMove }: MoveNoteModalProps) => {
  const { t } = useTranslation()
  const currentNote = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId])
  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentNote?.parentId ?? null)

  const disabledIds = useMemo(() => {
    const set = new Set<string>([noteId])
    const descendants = getAllDescendantIds(notes, noteId)
    descendants.forEach((id) => set.add(id))
    return set
  }, [notes, noteId])

  const tree = useMemo(() => {
    return buildNoteTree(notes.filter((n) => n.kind === (currentNote?.kind ?? 'note')))
  }, [notes, currentNote?.kind])

  const handleConfirm = () => {
    onMove(noteId, selectedParentId)
    onClose()
  }

  const renderOptions = (nodes: NoteTreeNode[]): React.ReactNode => {
    return nodes.map((node) => {
      const isDisabled = disabledIds.has(node.id)
      const isSelected = selectedParentId === node.id
      return (
        <div key={node.id} className="move-note-node" style={{ paddingLeft: `${node.depth * 16}px` }}>
          <button
            type="button"
            className={`move-note-item-btn ${isSelected ? 'is-selected' : ''} ${isDisabled ? 'is-disabled' : ''}`}
            disabled={isDisabled}
            onClick={() => setSelectedParentId(node.id)}
          >
            <FolderTree size={14} />
            <span className="move-note-item-title">{node.title.trim() || t('notes.untitled')}</span>
            {node.id === currentNote?.parentId && <span className="move-note-current-badge">текущий</span>}
          </button>
          {node.children.length > 0 && renderOptions(node.children)}
        </div>
      )
    })
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={t('notes.tree.moveTitle')} description={t('notes.tree.moveDesc')}>
      <div className="move-note-dialog">
        <div className="move-note-list">
          <button
            type="button"
            className={`move-note-item-btn move-note-root-btn ${selectedParentId === null ? 'is-selected' : ''}`}
            onClick={() => setSelectedParentId(null)}
          >
            <FolderRoot size={16} />
            <strong>{t('notes.tree.moveToRoot')}</strong>
            {currentNote?.parentId === null && <span className="move-note-current-badge">текущий</span>}
          </button>

          <div className="move-note-tree">{renderOptions(tree)}</div>
        </div>

        <div className="move-note-footer">
          <Button variant="ghost" onClick={onClose}>
            {t('notes.tree.cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={selectedParentId === currentNote?.parentId}>
            {t('notes.tree.move')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

import { useCallback, useMemo, useState } from 'react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FileText, Image as ImageIcon, Music, Plus, Upload } from 'lucide-react'
import { BlockItem } from './BlockItem'
import { SlashMenu } from './SlashMenu'
import { detectMediaType, optimizeImageIfNeeded, readFileAsDataUrl } from './mediaUtils'
import { createBlock, parseBlocks, serializeBlocks } from './serialization'
import type { Block, BlockType } from './types'
import { useTranslation } from '../../lib/i18n'
import './BlockEditor.css'

export type BlockEditorProps = {
  initialContent: string
  onChange: (serialized: string) => void
  isSimple?: boolean
}

export const BlockEditor = ({ initialContent, onChange, isSimple }: BlockEditorProps) => {
  const { t } = useTranslation()
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(initialContent))
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [slashState, setSlashState] = useState<{
    blockId: string
    query: string
    position: { top: number; left: number }
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks])

  const notifyChange = useCallback(
    (next: Block[]) => {
      setBlocks(next)
      onChange(serializeBlocks(next))
    },
    [onChange],
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blockIds.indexOf(String(active.id))
    const newIndex = blockIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(blocks, oldIndex, newIndex)
    notifyChange(reordered)
  }

  const handleUpdateBlock = (id: string, patch: Partial<Block>) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b))
    notifyChange(next)
  }

  const handleAddBelow = (targetId: string, type: BlockType = 'p') => {
    const index = blocks.findIndex((b) => b.id === targetId)
    const newBlock = createBlock(type)
    const next = [...blocks]
    next.splice(index + 1, 0, newBlock)
    notifyChange(next)
    setFocusedId(newBlock.id)
  }

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      notifyChange([createBlock('p', '')])
      return
    }
    const index = blocks.findIndex((b) => b.id === id)
    const next = blocks.filter((b) => b.id !== id)
    notifyChange(next)
    const prevBlock = next[Math.max(0, index - 1)]
    if (prevBlock) setFocusedId(prevBlock.id)
  }

  const handleDuplicateBlock = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id)
    const current = blocks[index]
    if (!current) return
    const duplicated = createBlock(current.type, current.content, {
      checked: current.checked,
      open: current.open,
      emoji: current.emoji,
      language: current.language,
    })
    const next = [...blocks]
    next.splice(index + 1, 0, duplicated)
    notifyChange(next)
  }

  const handleFocusPrevious = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id)
    if (index > 0) setFocusedId(blocks[index - 1].id)
  }

  const handleFocusNext = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id)
    if (index < blocks.length - 1) setFocusedId(blocks[index + 1].id)
  }

  const handleOpenSlash = (blockId: string, query: string, rect: DOMRect) => {
    const menuHeight = 320
    const menuWidth = 290
    const fitsBelow = rect.bottom + menuHeight + 12 <= window.innerHeight
    const top = fitsBelow ? rect.bottom + 4 : Math.max(8, rect.top - menuHeight - 4)
    const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - menuWidth - 16))

    setSlashState({
      blockId,
      query,
      position: { top, left },
    })
  }

  const handleSelectSlashType = (type: BlockType) => {
    if (!slashState) return
    const target = blocks.find((b) => b.id === slashState.blockId)
    if (!target) return

    const cleanContent = target.content.replace(/^\/[a-zA-Z0-9а-яА-Я]*/, '')
    handleUpdateBlock(slashState.blockId, { type, content: cleanContent })
    setSlashState(null)
    setFocusedId(slashState.blockId)
  }

  const handleAppendBlock = (type: BlockType = 'p') => {
    const newBlock = createBlock(type)
    notifyChange([...blocks, newBlock])
    setFocusedId(newBlock.id)
  }

  const handleEditorDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setIsDraggingFiles(true)
    }
  }

  const handleEditorDragLeave = (e: React.DragEvent) => {
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) return
    setIsDraggingFiles(false)
  }

  const handleEditorDrop = async (e: React.DragEvent) => {
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return
    e.preventDefault()
    setIsDraggingFiles(false)

    const files = Array.from(e.dataTransfer.files)
    const newBlocks: Block[] = []

    for (const file of files) {
      const mediaType = detectMediaType(file)
      if (mediaType === 'image') {
        const { dataUrl, size } = await optimizeImageIfNeeded(file)
        newBlocks.push(
          createBlock('image', '', {
            url: dataUrl,
            fileName: file.name,
            fileSize: size,
            mimeType: file.type,
          }),
        )
      } else if (mediaType === 'audio') {
        const dataUrl = await readFileAsDataUrl(file)
        newBlocks.push(
          createBlock('audio', '', {
            url: dataUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'audio/mpeg',
          }),
        )
      } else if (mediaType === 'pdf') {
        const dataUrl = await readFileAsDataUrl(file)
        newBlocks.push(
          createBlock('pdf', '', {
            url: dataUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: 'application/pdf',
          }),
        )
      }
    }

    if (newBlocks.length > 0) {
      notifyChange([...blocks, ...newBlocks])
      setFocusedId(newBlocks[newBlocks.length - 1].id)
    }
  }

  const handleEditorPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          const { dataUrl, size } = await optimizeImageIfNeeded(file)
          const newBlock = createBlock('image', '', {
            url: dataUrl,
            fileName: file.name || 'image.png',
            fileSize: size,
            mimeType: file.type,
          })
          const insertIdx = focusedId ? blocks.findIndex((b) => b.id === focusedId) : -1
          const next = [...blocks]
          if (insertIdx >= 0) {
            next.splice(insertIdx + 1, 0, newBlock)
          } else {
            next.push(newBlock)
          }
          notifyChange(next)
          setFocusedId(newBlock.id)
          break
        }
      }
    }
  }

  return (
    <div
      className={`block-editor ${isDraggingFiles ? 'is-dragging-files' : ''}`}
      onDragOver={handleEditorDragOver}
      onDragLeave={handleEditorDragLeave}
      onDrop={handleEditorDrop}
      onPaste={handleEditorPaste}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div className="block-list">
            {blocks.map((block, index) => (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                onChange={handleUpdateBlock}
                onAddBelow={handleAddBelow}
                onDelete={handleDeleteBlock}
                onDuplicate={handleDuplicateBlock}
                onFocusPrevious={handleFocusPrevious}
                onFocusNext={handleFocusNext}
                onOpenSlash={handleOpenSlash}
                isFocused={focusedId === block.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="block-editor-footer">
        <button type="button" className="block-add-end-btn" onClick={() => handleAppendBlock('p')}>
          <Plus size={14} /> {t('blocks.editor.addBlock')}
        </button>

        {!isSimple && (
          <div className="block-quick-media-group">
            <button
              type="button"
              className="block-quick-media-btn"
              onClick={() => handleAppendBlock('image')}
              title={t('blocks.editor.addImage')}
            >
              <ImageIcon size={13} />
              <span>{t('blocks.editor.image')}</span>
            </button>
            <button
              type="button"
              className="block-quick-media-btn"
              onClick={() => handleAppendBlock('audio')}
              title={t('blocks.editor.addAudio')}
            >
              <Music size={13} />
              <span>{t('blocks.editor.audio')}</span>
            </button>
            <button
              type="button"
              className="block-quick-media-btn"
              onClick={() => handleAppendBlock('pdf')}
              title={t('blocks.editor.addPdf')}
            >
              <FileText size={13} />
              <span>{t('blocks.editor.pdf')}</span>
            </button>
          </div>
        )}
      </div>

      {isDraggingFiles && (
        <div className="block-editor-drag-overlay">
          <Upload size={32} />
          <span>{t('blocks.editor.dropFiles')}</span>
        </div>
      )}

      {slashState && (
        <SlashMenu
          query={slashState.query}
          position={slashState.position}
          onSelect={handleSelectSlashType}
          onClose={() => setSlashState(null)}
        />
      )}
    </div>
  )
}

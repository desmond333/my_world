import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, ChevronDown, ChevronRight, Copy, GripVertical, Plus, Trash2 } from 'lucide-react'
import type { Block, BlockType } from './types'
import { MediaBlock } from './components/MediaBlock'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '../../shared/ui'

export type BlockItemProps = {
  block: Block
  index: number
  onChange: (id: string, patch: Partial<Block>) => void
  onAddBelow: (id: string, type?: BlockType) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onFocusPrevious: (id: string) => void
  onFocusNext: (id: string) => void
  onOpenSlash: (id: string, query: string, rect: DOMRect) => void
  isFocused?: boolean
}

const EMOJI_OPTIONS = ['💡', '📌', '⭐', '🔥', '⚠️', '🌙', '🎯', '🚀', '📝', '✨']

export const BlockItem = ({
  block,
  index,
  onChange,
  onAddBelow,
  onDelete,
  onDuplicate,
  onFocusPrevious,
  onFocusNext,
  onOpenSlash,
  isFocused,
}: BlockItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const adjustHeight = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.max(24, el.scrollHeight)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [block.content, block.type])

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [isFocused])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value

    if (val === '# ') {
      onChange(block.id, { type: 'h1', content: '' })
      return
    }
    if (val === '## ') {
      onChange(block.id, { type: 'h2', content: '' })
      return
    }
    if (val === '### ') {
      onChange(block.id, { type: 'h3', content: '' })
      return
    }
    if (val === '- ' || val === '* ') {
      onChange(block.id, { type: 'bullet', content: '' })
      return
    }
    if (val === '1. ') {
      onChange(block.id, { type: 'numbered', content: '' })
      return
    }
    if (val === '[] ' || val === '[ ] ') {
      onChange(block.id, { type: 'todo', content: '', checked: false })
      return
    }
    if (val === '> ') {
      onChange(block.id, { type: 'quote', content: '' })
      return
    }
    if (val === '---') {
      onChange(block.id, { type: 'divider', content: '' })
      return
    }

    if (val.startsWith('/')) {
      const query = val.slice(1)
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect()
        onOpenSlash(block.id, query, rect)
      }
    }

    onChange(block.id, { content: val })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddBelow(block.id)
      return
    }

    if (e.key === 'Backspace' && textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current
      if (selectionStart === 0 && selectionEnd === 0) {
        if (block.type !== 'p') {
          e.preventDefault()
          onChange(block.id, { type: 'p' })
          return
        }
        if (!block.content) {
          e.preventDefault()
          onDelete(block.id)
          return
        }
      }
    }

    if (e.key === 'ArrowUp' && textareaRef.current?.selectionStart === 0) {
      e.preventDefault()
      onFocusPrevious(block.id)
    }

    if (e.key === 'ArrowDown' && textareaRef.current) {
      const len = textareaRef.current.value.length
      if (textareaRef.current.selectionStart === len) {
        e.preventDefault()
        onFocusNext(block.id)
      }
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(block.content)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 1600)
    } catch {
      void 0
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`block-item block-item--${block.type}`}>
      <div className="block-handle-zone">
        <Tooltip content="Перетащить блок">
          <button type="button" className="block-drag-handle" {...attributes} {...listeners} aria-label="Перетащить блок">
            <GripVertical size={14} />
          </button>
        </Tooltip>

        <div className="block-menu-wrapper">
          <Tooltip content="Добавить блок ниже">
            <button type="button" className="block-add-btn" onClick={() => onAddBelow(block.id)} aria-label="Добавить блок ниже">
              <Plus size={13} />
            </button>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="block-opts-btn" aria-label="Параметры блока">
                ···
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4}>
              <DropdownMenuItem onClick={() => onDuplicate(block.id)}>
                <Copy size={13} /> Дублировать
              </DropdownMenuItem>
              <DropdownMenuItem className="is-danger" onClick={() => onDelete(block.id)}>
                <Trash2 size={13} /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="block-content-area">
        {block.type === 'todo' && (
          <button
            type="button"
            className={`block-checkbox ${block.checked ? 'is-checked' : ''}`}
            onClick={() => onChange(block.id, { checked: !block.checked })}
          >
            {block.checked && <Check size={12} strokeWidth={3} />}
          </button>
        )}

        {block.type === 'bullet' && <span className="block-bullet-marker">•</span>}

        {block.type === 'numbered' && <span className="block-number-marker">{index + 1}.</span>}

        {block.type === 'toggle' && (
          <button type="button" className="block-toggle-arrow" onClick={() => onChange(block.id, { open: !block.open })}>
            {block.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        {block.type === 'callout' && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="block-callout-emoji" aria-label="Выбрать эмодзи">
                {block.emoji || '💡'}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} style={{ padding: '8px', width: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onChange(block.id, { emoji })}
                    style={{
                      background: block.emoji === emoji ? 'var(--line)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '18px',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {block.type === 'divider' ? (
          <div className="block-divider-line" />
        ) : block.type === 'image' || block.type === 'audio' || block.type === 'pdf' ? (
          <MediaBlock block={block} onChange={onChange} onDelete={onDelete} />
        ) : (
          <textarea
            ref={textareaRef}
            className={`block-textarea ${block.type === 'todo' && block.checked ? 'is-done' : ''}`}
            value={block.content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              block.type === 'h1'
                ? 'Заголовок 1'
                : block.type === 'h2'
                  ? 'Заголовок 2'
                  : block.type === 'h3'
                    ? 'Заголовок 3'
                    : block.type === 'code'
                      ? 'Введите код...'
                      : block.type === 'callout'
                        ? 'Выделенная мысль...'
                        : block.type === 'quote'
                          ? 'Цитата...'
                          : "Нажмите '/' для команд..."
            }
          />
        )}

        {block.type === 'code' && (
          <div className="block-code-actions">
            <span className="block-code-lang">{block.language || 'code'}</span>
            <Tooltip content="Скопировать код">
              <button type="button" className="block-code-copy" onClick={handleCopyCode} aria-label="Скопировать код">
                {codeCopied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

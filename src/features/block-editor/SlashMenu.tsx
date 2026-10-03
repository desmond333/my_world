import { useEffect, useMemo, useRef, useState } from 'react'
import { SLASH_ITEMS } from './slashCommands'
import type { BlockType, SlashItem } from './types'
import { useTranslation } from '../../lib/i18n'

export type SlashMenuProps = {
  query: string
  onSelect: (type: BlockType) => void
  onClose: () => void
  position?: { top: number; left: number }
}

export const SlashMenu = ({ query, onSelect, onClose, position }: SlashMenuProps) => {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SLASH_ITEMS
    return SLASH_ITEMS.filter(
      (item) =>
        t(item.title).toLowerCase().includes(q) ||
        t(item.description).toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q)),
    )
  }, [query, t])

  const [prevQuery, setPrevQuery] = useState(query)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (prevQuery !== query) {
    setPrevQuery(query)
    setSelectedIndex(0)
  }

  useEffect(() => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('.slash-item-btn')
    if (items && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [filtered, onSelect, onClose, selectedIndex])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [onClose])

  const basicItems = filtered.filter((i) => i.group === 'basic')
  const advancedItems = filtered.filter((i) => i.group === 'advanced')

  const renderItem = (item: SlashItem) => {
    const Icon = item.icon
    const isSelected = filtered[selectedIndex]?.type === item.type
    return (
      <button
        key={item.type}
        type="button"
        className={`slash-item-btn ${isSelected ? 'is-selected' : ''}`}
        onClick={() => onSelect(item.type)}
        onMouseEnter={() => {
          const idx = filtered.indexOf(item)
          if (idx >= 0) setSelectedIndex(idx)
        }}
      >
        <span className="slash-item-icon">
          <Icon size={16} />
        </span>
        <span className="slash-item-content">
          <strong className="slash-item-title">{t(item.title)}</strong>
          <span className="slash-item-desc">{t(item.description)}</span>
        </span>
      </button>
    )
  }

  return (
    <div ref={menuRef} className="slash-menu" style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}>
      <div className="slash-menu-header">
        <span>{t('blocks.slash.header')}</span>
      </div>

      <div className="slash-menu-list">
        {filtered.length === 0 ? (
          <div className="slash-menu-empty">{t('blocks.slash.empty')}</div>
        ) : (
          <>
            {basicItems.length > 0 && (
              <div className="slash-group">
                <span className="slash-group-label">{t('blocks.slash.group.basic')}</span>
                {basicItems.map(renderItem)}
              </div>
            )}
            {advancedItems.length > 0 && (
              <div className="slash-group">
                <span className="slash-group-label">{t('blocks.slash.group.advanced')}</span>
                {advancedItems.map(renderItem)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Music,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { formatFileSize, optimizeImageIfNeeded, readFileAsDataUrl } from '../mediaUtils'
import type { Block } from '../types'

export type MediaBlockProps = {
  block: Block
  onChange: (id: string, patch: Partial<Block>) => void
  onDelete: (id: string) => void
}

const isSafeMediaUrl = (url?: string): boolean => {
  if (!url) return false
  const lower = url.trim().toLowerCase()
  return lower.startsWith('https://') || lower.startsWith('http://') || lower.startsWith('data:')
}

export const MediaBlock = ({ block, onChange, onDelete }: MediaBlockProps) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPdfExpanded, setIsPdfExpanded] = useState(true)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setIsLoading(true)
    try {
      if (block.type === 'image') {
        const { dataUrl, size } = await optimizeImageIfNeeded(file)
        onChange(block.id, {
          url: dataUrl,
          fileName: file.name,
          fileSize: size,
          mimeType: file.type,
        })
      } else if (block.type === 'audio') {
        const dataUrl = await readFileAsDataUrl(file)
        onChange(block.id, {
          url: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'audio/mpeg',
        })
      } else if (block.type === 'pdf') {
        const dataUrl = await readFileAsDataUrl(file)
        onChange(block.id, {
          url: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: 'application/pdf',
        })
      }
    } catch {
      void 0
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (!trimmed || !isSafeMediaUrl(trimmed)) return
    const inferredName = trimmed.split('/').pop()?.split('?')[0] || 'media'
    onChange(block.id, {
      url: trimmed,
      fileName: inferredName,
    })
  }

  const handleReplace = () => {
    onChange(block.id, { url: '', fileName: '', fileSize: undefined })
    setUrlInput('')
  }

  const renderEmptyState = () => {
    const isImage = block.type === 'image'
    const isAudio = block.type === 'audio'

    const accept = isImage ? 'image/*' : isAudio ? 'audio/*' : 'application/pdf'
    const title = isImage ? 'Изображение' : isAudio ? 'Аудиозапись' : 'PDF Документ'
    const formatsHint = isImage ? 'PNG, JPG, SVG, WebP, GIF' : isAudio ? 'MP3, WAV, OGG, M4A, AAC' : 'PDF файлы до 25 МБ'

    const Icon = isImage ? ImageIcon : isAudio ? Music : FileText

    return (
      <div className="block-media-empty">
        <div className="block-media-tabs">
          <button type="button" className={`block-media-tab ${tab === 'upload' ? 'is-active' : ''}`} onClick={() => setTab('upload')}>
            <Upload size={12} /> Загрузить файл
          </button>
          <button type="button" className={`block-media-tab ${tab === 'url' ? 'is-active' : ''}`} onClick={() => setTab('url')}>
            <ExternalLink size={12} /> Вставить ссылку
          </button>
        </div>

        {tab === 'upload' ? (
          <div
            className={`block-media-dropzone ${isDragOver ? 'is-dragover' : ''} ${isLoading ? 'is-loading' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <div className="block-media-dropzone-icon">
              <Icon size={24} />
            </div>
            <div className="block-media-dropzone-text">
              <span className="block-media-dropzone-main">
                {isLoading ? 'Загрузка...' : `Нажмите или перетащите ${title.toLowerCase()} сюда`}
              </span>
              <span className="block-media-dropzone-sub">{formatsHint}</span>
            </div>
          </div>
        ) : (
          <form className="block-media-url-form" onSubmit={handleApplyUrl}>
            <input
              type="url"
              className="block-media-url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Вставьте ссылку https://..."
              autoFocus
            />
            <button type="submit" className="block-media-url-btn" disabled={!urlInput.trim()}>
              Встроить
            </button>
          </form>
        )}
      </div>
    )
  }

  if (!block.url) {
    return renderEmptyState()
  }

  if (block.type === 'image') {
    return (
      <div className="block-media-container block-media--image">
        <div className="block-image-view">
          <div className="block-media-toolbar">
            <button type="button" className="block-media-tool-btn" onClick={() => setIsImageModalOpen(true)} title="Открыть на весь экран">
              <Maximize2 size={13} />
            </button>
            {block.url && isSafeMediaUrl(block.url) && (
              <a
                href={block.url}
                download={block.fileName || 'image.png'}
                rel="noopener noreferrer"
                className="block-media-tool-btn"
                title="Скачать"
              >
                <Download size={13} />
              </a>
            )}
            <button type="button" className="block-media-tool-btn" onClick={handleReplace} title="Заменить">
              <RefreshCw size={13} />
            </button>
            <button type="button" className="block-media-tool-btn is-danger" onClick={() => onDelete(block.id)} title="Удалить">
              <Trash2 size={13} />
            </button>
          </div>

          <img
            src={block.url}
            alt={block.caption || block.fileName || 'Изображение'}
            className="block-image-element"
            loading="lazy"
            onClick={() => setIsImageModalOpen(true)}
          />
        </div>

        <input
          type="text"
          className="block-image-caption"
          value={block.caption || ''}
          onChange={(e) => onChange(block.id, { caption: e.target.value })}
          placeholder="Добавить подпись..."
        />

        {isImageModalOpen && (
          <div className="block-media-modal-backdrop" onClick={() => setIsImageModalOpen(false)}>
            <div className="block-media-modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="block-media-modal-close" onClick={() => setIsImageModalOpen(false)} title="Закрыть">
                <X size={18} />
              </button>
              <img src={block.url} alt={block.caption || block.fileName || 'Изображение'} className="block-media-modal-img" />
              {block.caption && <p className="block-media-modal-caption">{block.caption}</p>}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (block.type === 'audio') {
    return (
      <div className="block-media-container block-media--audio">
        <div className="block-audio-card">
          <div className="block-audio-header">
            <div className="block-audio-icon-wrap">
              <Music size={18} />
            </div>
            <div className="block-audio-info">
              <span className="block-audio-name">{block.fileName || 'Аудиозапись'}</span>
              {block.fileSize && <span className="block-audio-size">{formatFileSize(block.fileSize)}</span>}
            </div>
            <div className="block-media-toolbar is-static">
              {block.url && isSafeMediaUrl(block.url) && (
                <a
                  href={block.url}
                  download={block.fileName || 'audio.mp3'}
                  rel="noopener noreferrer"
                  className="block-media-tool-btn"
                  title="Скачать"
                >
                  <Download size={13} />
                </a>
              )}
              <button type="button" className="block-media-tool-btn" onClick={handleReplace} title="Заменить">
                <RefreshCw size={13} />
              </button>
              <button type="button" className="block-media-tool-btn is-danger" onClick={() => onDelete(block.id)} title="Удалить">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="block-audio-player-wrap">
            <audio controls src={isSafeMediaUrl(block.url) ? block.url : undefined} preload="metadata" className="block-audio-element" />
          </div>
        </div>
      </div>
    )
  }

  if (block.type === 'pdf') {
    return (
      <div className="block-media-container block-media--pdf">
        <div className="block-pdf-card">
          <div className="block-pdf-header">
            <div className="block-pdf-icon-wrap">
              <FileText size={18} />
            </div>
            <div className="block-pdf-info">
              <span className="block-pdf-name">{block.fileName || 'Документ PDF'}</span>
              {block.fileSize && <span className="block-pdf-size">{formatFileSize(block.fileSize)}</span>}
            </div>
            <div className="block-media-toolbar is-static">
              <button
                type="button"
                className="block-media-tool-btn"
                onClick={() => setIsPdfExpanded((v) => !v)}
                title={isPdfExpanded ? 'Свернуть предпросмотр' : 'Развернуть предпросмотр'}
              >
                {isPdfExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                type="button"
                className="block-media-tool-btn"
                onClick={() => {
                  if (isSafeMediaUrl(block.url)) {
                    window.open(block.url, '_blank', 'noopener,noreferrer')
                  }
                }}
                title="Открыть в новой вкладке"
              >
                <ExternalLink size={13} />
              </button>
              {block.url && isSafeMediaUrl(block.url) && (
                <a
                  href={block.url}
                  download={block.fileName || 'document.pdf'}
                  rel="noopener noreferrer"
                  className="block-media-tool-btn"
                  title="Скачать"
                >
                  <Download size={13} />
                </a>
              )}
              <button type="button" className="block-media-tool-btn" onClick={handleReplace} title="Заменить">
                <RefreshCw size={13} />
              </button>
              <button type="button" className="block-media-tool-btn is-danger" onClick={() => onDelete(block.id)} title="Удалить">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {isPdfExpanded && isSafeMediaUrl(block.url) && (
            <div className="block-pdf-preview-wrap">
              <object data={block.url} type="application/pdf" className="block-pdf-object">
                <iframe src={block.url} title={block.fileName || 'PDF Document'} className="block-pdf-iframe">
                  <div className="block-pdf-fallback">
                    <p>Предпросмотр PDF недоступен в вашем браузере.</p>
                    <a href={block.url} target="_blank" rel="noopener noreferrer" className="block-media-url-btn">
                      Открыть файл
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

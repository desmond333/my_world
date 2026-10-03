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
import { Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import type { Block } from '../types'

export type MediaBlockProps = {
  block: Block
  onChange: (id: string, patch: Partial<Block>) => void
  onDelete: (id: string) => void
}

const isSafeMediaUrl = (url: string | undefined, kind: Block['type']): boolean => {
  if (!url) return false
  const value = url.trim()
  const lower = value.toLowerCase()
  if (lower.startsWith('https://')) return true
  if (!lower.startsWith('data:')) return false
  if (kind === 'image') return /^data:image\//i.test(value)
  if (kind === 'audio') return /^data:audio\//i.test(value)
  if (kind === 'pdf') return /^data:application\/pdf/i.test(value)
  return false
}

export const MediaBlock = ({ block, onChange, onDelete }: MediaBlockProps) => {
  const { t } = useTranslation()
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
    if (!trimmed || !isSafeMediaUrl(trimmed, block.type)) return
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
    const dropLabel = isImage ? t('blocks.media.dropImage') : isAudio ? t('blocks.media.dropAudio') : t('blocks.media.dropPdf')
    const formatsHint = isImage ? t('blocks.media.hint.image') : isAudio ? t('blocks.media.hint.audio') : t('blocks.media.hint.pdf')

    const Icon = isImage ? ImageIcon : isAudio ? Music : FileText

    return (
      <div className="block-media-empty">
        <Tabs value={tab} onValueChange={(val) => setTab(val as 'upload' | 'url')}>
          <TabsList aria-label={t('blocks.media.uploadFile')}>
            <TabsTrigger value="upload">
              <Upload size={12} /> {t('blocks.media.uploadFile')}
            </TabsTrigger>
            <TabsTrigger value="url">
              <ExternalLink size={12} /> {t('blocks.media.pasteLink')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
              <span className="block-media-dropzone-main">{isLoading ? t('blocks.media.loading') : dropLabel}</span>
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
              placeholder={t('blocks.media.urlPlaceholder')}
              autoFocus
            />
            <button type="submit" className="block-media-url-btn" disabled={!urlInput.trim()}>
              {t('blocks.media.embed')}
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
            <button
              type="button"
              className="block-media-tool-btn"
              onClick={() => setIsImageModalOpen(true)}
              title={t('blocks.media.fullscreen')}
            >
              <Maximize2 size={13} />
            </button>
            {block.url && isSafeMediaUrl(block.url, block.type) && (
              <a
                href={block.url}
                download={block.fileName || 'image.png'}
                rel="noopener noreferrer"
                className="block-media-tool-btn"
                title={t('blocks.media.download')}
              >
                <Download size={13} />
              </a>
            )}
            <button type="button" className="block-media-tool-btn" onClick={handleReplace} title={t('blocks.media.replace')}>
              <RefreshCw size={13} />
            </button>
            <button
              type="button"
              className="block-media-tool-btn is-danger"
              onClick={() => onDelete(block.id)}
              title={t('blocks.media.delete')}
            >
              <Trash2 size={13} />
            </button>
          </div>

          <img
            src={block.url}
            alt={block.caption || block.fileName || t('blocks.media.imageAlt')}
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
          placeholder={t('blocks.media.addCaption')}
        />

        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="block-media-modal-content" showCloseButton={false} aria-describedby={undefined}>
            <DialogTitle className="block-media-modal-title">{block.caption || block.fileName || t('blocks.media.imageAlt')}</DialogTitle>
            <button
              type="button"
              className="block-media-modal-close"
              onClick={() => setIsImageModalOpen(false)}
              title={t('blocks.media.close')}
            >
              <X size={18} />
            </button>
            <img src={block.url} alt={block.caption || block.fileName || t('blocks.media.imageAlt')} className="block-media-modal-img" />
            {block.caption && <p className="block-media-modal-caption">{block.caption}</p>}
          </DialogContent>
        </Dialog>
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
              <span className="block-audio-name">{block.fileName || t('blocks.media.audioTitle')}</span>
              {block.fileSize && <span className="block-audio-size">{formatFileSize(block.fileSize)}</span>}
            </div>
            <div className="block-media-toolbar is-static">
              {block.url && isSafeMediaUrl(block.url, block.type) && (
                <a
                  href={block.url}
                  download={block.fileName || 'audio.mp3'}
                  rel="noopener noreferrer"
                  className="block-media-tool-btn"
                  title={t('blocks.media.download')}
                >
                  <Download size={13} />
                </a>
              )}
              <button type="button" className="block-media-tool-btn" onClick={handleReplace} title={t('blocks.media.replace')}>
                <RefreshCw size={13} />
              </button>
              <button
                type="button"
                className="block-media-tool-btn is-danger"
                onClick={() => onDelete(block.id)}
                title={t('blocks.media.delete')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="block-audio-player-wrap">
            <audio
              controls
              src={isSafeMediaUrl(block.url, block.type) ? block.url : undefined}
              preload="metadata"
              className="block-audio-element"
            />
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
              <span className="block-pdf-name">{block.fileName || t('blocks.media.pdfTitle')}</span>
              {block.fileSize && <span className="block-pdf-size">{formatFileSize(block.fileSize)}</span>}
            </div>
            <div className="block-media-toolbar is-static">
              <button
                type="button"
                className="block-media-tool-btn"
                onClick={() => setIsPdfExpanded((v) => !v)}
                title={isPdfExpanded ? t('blocks.media.collapsePreview') : t('blocks.media.expandPreview')}
              >
                {isPdfExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                type="button"
                className="block-media-tool-btn"
                onClick={() => {
                  if (isSafeMediaUrl(block.url, block.type)) {
                    window.open(block.url, '_blank', 'noopener,noreferrer')
                  }
                }}
                title={t('blocks.media.openNewTab')}
              >
                <ExternalLink size={13} />
              </button>
              {block.url && isSafeMediaUrl(block.url, block.type) && (
                <a
                  href={block.url}
                  download={block.fileName || 'document.pdf'}
                  rel="noopener noreferrer"
                  className="block-media-tool-btn"
                  title={t('blocks.media.download')}
                >
                  <Download size={13} />
                </a>
              )}
              <button type="button" className="block-media-tool-btn" onClick={handleReplace} title={t('blocks.media.replace')}>
                <RefreshCw size={13} />
              </button>
              <button
                type="button"
                className="block-media-tool-btn is-danger"
                onClick={() => onDelete(block.id)}
                title={t('blocks.media.delete')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {isPdfExpanded && isSafeMediaUrl(block.url, block.type) && (
            <div className="block-pdf-preview-wrap">
              <object data={block.url} type="application/pdf" className="block-pdf-object">
                <iframe src={block.url} title={block.fileName || 'PDF Document'} className="block-pdf-iframe">
                  <div className="block-pdf-fallback">
                    <p>{t('blocks.media.pdfUnsupported')}</p>
                    <a href={block.url} target="_blank" rel="noopener noreferrer" className="block-media-url-btn">
                      {t('blocks.media.openFile')}
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

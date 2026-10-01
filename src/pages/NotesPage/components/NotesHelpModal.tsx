import { useState } from 'react'
import {
  CheckSquare,
  Code,
  Command,
  FileText,
  FolderTree,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Info,
  Keyboard,
  List,
  Minus,
  Music,
  Quote,
  Sparkles,
} from 'lucide-react'
import { Button, Modal } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import './NotesHelpModal.css'

export type NotesHelpModalProps = {
  isOpen: boolean
  onClose: () => void
}

type TabKey = 'slash' | 'blocks' | 'keys' | 'media' | 'tree'

export const NotesHelpModal = ({ isOpen, onClose }: NotesHelpModalProps) => {
  const { t, lang } = useTranslation()
  const isEn = lang === 'en'
  const [activeTab, setActiveTab] = useState<TabKey>('slash')

  const commands = [
    {
      cmd: '/h1',
      title: isEn ? 'Heading 1' : 'Заголовок 1',
      desc: isEn ? 'Large section header' : 'Крупный заголовок раздела',
      icon: Heading1,
    },
    {
      cmd: '/h2',
      title: isEn ? 'Heading 2' : 'Заголовок 2',
      desc: isEn ? 'Medium subsection header' : 'Средний заголовок подраздела',
      icon: Heading2,
    },
    {
      cmd: '/h3',
      title: isEn ? 'Heading 3' : 'Заголовок 3',
      desc: isEn ? 'Small section header' : 'Компактный заголовок секции',
      icon: Heading3,
    },
    {
      cmd: '/todo',
      title: isEn ? 'To-do item' : 'Список задач',
      desc: isEn ? 'Checkbox item with completion toggle' : 'Чек-бокс для выполнения задач',
      icon: CheckSquare,
    },
    {
      cmd: '/bullet',
      title: isEn ? 'Bullet list' : 'Маркированный список',
      desc: isEn ? 'Simple bullet point' : 'Список с маркерами-точками',
      icon: List,
    },
    {
      cmd: '/quote',
      title: isEn ? 'Quote' : 'Цитата',
      desc: isEn ? 'Blockquote with accent line' : 'Цитата с акцентной полосой',
      icon: Quote,
    },
    {
      cmd: '/callout',
      title: isEn ? 'Callout' : 'Выделенная рамка',
      desc: isEn ? 'Framed note with emoji icon' : 'Заметная рамка с эмодзи',
      icon: Info,
    },
    {
      cmd: '/code',
      title: isEn ? 'Code block' : 'Блок кода',
      desc: isEn ? 'Code snippet with syntax support' : 'Блок кода с указанием языка',
      icon: Code,
    },
    {
      cmd: '/divider',
      title: isEn ? 'Divider' : 'Разделитель',
      desc: isEn ? 'Horizontal dividing rule' : 'Горизонтальная черта-разделитель',
      icon: Minus,
    },
    {
      cmd: '/image',
      title: isEn ? 'Image' : 'Изображение',
      desc: isEn ? 'Photo, upload or link' : 'Загрузка с устройства или по ссылке',
      icon: Image,
    },
    {
      cmd: '/audio',
      title: isEn ? 'Audio' : 'Аудио',
      desc: isEn ? 'Music or voice with embedded player' : 'Аудиофайл со встроенным плеером',
      icon: Music,
    },
    {
      cmd: '/pdf',
      title: isEn ? 'PDF Document' : 'PDF документ',
      desc: isEn ? 'Embedded PDF viewer' : 'Документ PDF с предпросмотром',
      icon: FileText,
    },
  ]

  const shortcuts = [
    { key: '/', desc: isEn ? 'Open slash block menu anywhere in text' : 'Открыть меню вставки блоков прямо в тексте' },
    { key: 'Enter', desc: isEn ? 'Create new paragraph below' : 'Создать новый текстовый блок строкой ниже' },
    { key: 'Shift + Enter', desc: isEn ? 'Line break inside current block' : 'Перенос строки внутри текущего блока' },
    {
      key: 'Backspace',
      desc: isEn ? 'Reset block type or remove empty block' : 'В пустом блоке сбрасывает тип на обычный текст или удаляет его',
    },
    {
      key: '↑ / ↓',
      desc: isEn ? 'Navigate through slash menu or between blocks' : 'Навигация по выпадающему меню команд или между блоками',
    },
    { key: 'Escape', desc: isEn ? 'Close slash menu' : 'Закрыть меню команд' },
    { key: 'Ctrl + V', desc: isEn ? 'Paste screenshot or image directly' : 'Вставить скриншот или картинку прямо из буфера обмена' },
  ]

  return (
    <Modal open={isOpen} onClose={onClose} title={t('notes.help.title')} description={t('notes.help.subtitle')} maxWidth={720}>
      <div className="notes-help-modal">
        <div className="notes-help-tabs" role="tablist">
          <button
            type="button"
            className={`notes-help-tab-btn ${activeTab === 'slash' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('slash')}
          >
            <Command size={14} />
            <span>{isEn ? 'Slash commands (/)' : 'Команды (/)'}</span>
          </button>
          <button
            type="button"
            className={`notes-help-tab-btn ${activeTab === 'blocks' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('blocks')}
          >
            <GripVertical size={14} />
            <span>{isEn ? 'Drag & Drop' : 'Управление блоками'}</span>
          </button>
          <button
            type="button"
            className={`notes-help-tab-btn ${activeTab === 'keys' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <Keyboard size={14} />
            <span>{isEn ? 'Shortcuts' : 'Горячие клавиши'}</span>
          </button>
          <button
            type="button"
            className={`notes-help-tab-btn ${activeTab === 'media' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <Image size={14} />
            <span>{isEn ? 'Media' : 'Медиафайлы'}</span>
          </button>
          <button
            type="button"
            className={`notes-help-tab-btn ${activeTab === 'tree' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('tree')}
          >
            <FolderTree size={14} />
            <span>{isEn ? 'Page Tree' : 'Дерево страниц'}</span>
          </button>
        </div>

        <div className="notes-help-content">
          {activeTab === 'slash' && (
            <>
              <p className="notes-help-lead">
                {isEn
                  ? 'Type / in any block to quickly insert headers, lists, code, callouts or media. Start typing letters to filter commands instantly.'
                  : 'Нажмите символ / в любой строке, чтобы быстро выбрать и превратить блок в заголовок, список, цитату, выноску или медиа. Начните вводить текст после слэша для мгновенного поиска.'}
              </p>
              <div className="notes-help-grid">
                {commands.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <div key={cmd.cmd} className="notes-help-card">
                      <div className="notes-help-card-head">
                        <span className="notes-help-cmd-badge">{cmd.cmd}</span>
                        <Icon size={14} style={{ color: 'var(--muted)' }} />
                        <span className="notes-help-card-title">{cmd.title}</span>
                      </div>
                      <p className="notes-help-card-desc">{cmd.desc}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'blocks' && (
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <GripVertical size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Six Dots Handle (Drag & Drop)' : 'Ручка из 6 точек (Drag-and-Drop)'}</strong>
                  <p>
                    {isEn
                      ? 'Hover over any block on the left to reveal the 6-dots handle. Click and drag it up or down to reorder blocks in your document.'
                      : 'При наведении курсора на блок слева появляется ручка с 6 точками. Зажмите её левой кнопкой мыши и перетащите блок на любое новое место.'}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Sparkles size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Block Actions Menu (···)' : 'Меню блока (···)'}</strong>
                  <p>
                    {isEn
                      ? 'Use the block action menu to duplicate a block or delete it. You can also use the + button to quickly insert a new empty block below.'
                      : 'Через меню действий можно дублировать текущий блок со всем содержимым или удалить его. Кнопка + слева быстро вставляет новый блок под текущим.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="notes-help-feature-list">
              {shortcuts.map((sc) => (
                <div key={sc.key} className="notes-help-shortcut-row">
                  <span className="notes-help-key">{sc.key}</span>
                  <span className="notes-help-card-desc">{sc.desc}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Image size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Drag & Drop files' : 'Перетаскивание файлов прямо в окно'}</strong>
                  <p>
                    {isEn
                      ? 'You can drag images, audio tracks, and PDF documents from your computer directly into the editor. They will be embedded automatically.'
                      : 'Перетащите файл картинки, аудиозаписи или PDF-документа из папки на компьютере прямо в окно заметки. Блок создастся автоматически.'}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Keyboard size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Clipboard paste (Ctrl+V)' : 'Вставка скриншота из буфера (Ctrl+V)'}</strong>
                  <p>
                    {isEn
                      ? 'Take a screenshot with PrintScreen or snipping tool and press Ctrl+V directly in the note to paste the image.'
                      : 'Сделайте скриншот экрана и нажмите Ctrl+V прямо в редакторе — изображение сразу появится как блок картинки.'}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <FileText size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Built-in preview & players' : 'Встроенный плеер и просмотр PDF'}</strong>
                  <p>
                    {isEn
                      ? 'Audio files have a full playback controller. PDF documents can be previewed in an embedded viewer or downloaded.'
                      : 'Для аудио файлов доступен встроенный аудиоплеер, а для PDF — удобный предпросмотр документа и скачивание в один клик.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <FolderTree size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Infinite Nesting' : 'Бесконечная вложенность'}</strong>
                  <p>
                    {isEn
                      ? 'Create subpages inside any note like computer folders. Click + next to a note in the sidebar to add a nested subpage.'
                      : 'Создавайте страницы внутри других страниц на любую глубину. Нажмите + у любой заметки в боковом меню, чтобы создать дочернюю страницу.'}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Command size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{isEn ? 'Moving Pages & Breadcrumbs' : 'Перемещение страниц и навигация'}</strong>
                  <p>
                    {isEn
                      ? 'Use the Move button in the breadcrumb trail to reassign a page to a new parent or move it to root. Breadcrumbs at the top show full path.'
                      : 'Кнопка «Переместить» в цепочке навигации вверху позволяет сменить родительскую страницу в любой момент.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="notes-help-footer">
          <Button variant="outline" size="sm" onClick={onClose}>
            {isEn ? 'Got it' : 'Понятно'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

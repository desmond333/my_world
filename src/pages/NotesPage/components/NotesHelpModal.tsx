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
import { Button, Modal, Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui'
import { useTranslation } from '../../../lib/i18n'
import './NotesHelpModal.css'

export type NotesHelpModalProps = {
  isOpen: boolean
  onClose: () => void
}

type TabKey = 'slash' | 'blocks' | 'keys' | 'media' | 'tree'

export const NotesHelpModal = ({ isOpen, onClose }: NotesHelpModalProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('slash')

  const commands = [
    {
      cmd: '/h1',
      title: t('notesHelp.heading-1', 'Заголовок 1'),
      desc: t('notesHelp.large-section-header', 'Крупный заголовок раздела'),
      icon: Heading1,
    },
    {
      cmd: '/h2',
      title: t('notesHelp.heading-2', 'Заголовок 2'),
      desc: t('notesHelp.medium-subsection-header', 'Средний заголовок подраздела'),
      icon: Heading2,
    },
    {
      cmd: '/h3',
      title: t('notesHelp.heading-3', 'Заголовок 3'),
      desc: t('notesHelp.small-section-header', 'Компактный заголовок секции'),
      icon: Heading3,
    },
    {
      cmd: '/todo',
      title: t('notesHelp.to-do-item', 'Список задач'),
      desc: t('notesHelp.checkbox-item-with-completion-toggle', 'Чек-бокс для выполнения задач'),
      icon: CheckSquare,
    },
    {
      cmd: '/bullet',
      title: t('notesHelp.bullet-list', 'Маркированный список'),
      desc: t('notesHelp.simple-bullet-point', 'Список с маркерами-точками'),
      icon: List,
    },
    {
      cmd: '/quote',
      title: t('notesHelp.quote'),
      desc: t('notesHelp.blockquote-with-accent-line', 'Цитата с акцентной полосой'),
      icon: Quote,
    },
    {
      cmd: '/callout',
      title: t('notesHelp.callout'),
      desc: t('notesHelp.framed-note-with-emoji-icon', 'Заметная рамка с эмодзи'),
      icon: Info,
    },
    {
      cmd: '/code',
      title: t('notesHelp.code-block', 'Блок кода'),
      desc: t('notesHelp.code-snippet-with-syntax-support', 'Блок кода с указанием языка'),
      icon: Code,
    },
    {
      cmd: '/divider',
      title: t('notesHelp.divider'),
      desc: t('notesHelp.horizontal-dividing-rule', 'Горизонтальная черта-разделитель'),
      icon: Minus,
    },
    {
      cmd: '/image',
      title: t('notesHelp.image'),
      desc: t('notesHelp.photo-upload-or-link', 'Загрузка с устройства или по ссылке'),
      icon: Image,
    },
    {
      cmd: '/audio',
      title: t('notesHelp.audio'),
      desc: t('notesHelp.music-or-voice-with-embedded-player', 'Аудиофайл со встроенным плеером'),
      icon: Music,
    },
    {
      cmd: '/pdf',
      title: t('notesHelp.pdf-document', 'PDF документ'),
      desc: t('notesHelp.embedded-pdf-viewer', 'Документ PDF с предпросмотром'),
      icon: FileText,
    },
  ]

  const shortcuts = [
    { key: '/', desc: t('notesHelp.open-slash-block-menu-anywhere-in-text', 'Открыть меню вставки блоков прямо в тексте') },
    { key: 'Enter', desc: t('notesHelp.create-new-paragraph-below', 'Создать новый текстовый блок строкой ниже') },
    { key: 'Shift + Enter', desc: t('notesHelp.line-break-inside-current-block', 'Перенос строки внутри текущего блока') },
    {
      key: 'Backspace',
      desc: t('notesHelp.reset-block-type-or-remove-empty-block', 'В пустом блоке сбрасывает тип на обычный текст или удаляет его'),
    },
    {
      key: '↑ / ↓',
      desc: t('notesHelp.navigate-through-slash-menu-or-between-blocks', 'Навигация по выпадающему меню команд или между блоками'),
    },
    { key: 'Escape', desc: t('notesHelp.close-slash-menu', 'Закрыть меню команд') },
    { key: 'Ctrl + V', desc: t('notesHelp.paste-screenshot-or-image-directly', 'Вставить скриншот или картинку прямо из буфера обмена') },
  ]

  return (
    <Modal open={isOpen} onClose={onClose} title={t('notes.help.title')} description={t('notes.help.subtitle')} maxWidth={720}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="notes-help-modal">
        <TabsList aria-label={t('notes.help.title')}>
          <TabsTrigger value="slash">
            <Command size={14} />
            <span>{t('notesHelp.slash-commands', 'Команды (/)')}</span>
          </TabsTrigger>
          <TabsTrigger value="blocks">
            <GripVertical size={14} />
            <span>{t('notesHelp.drag-drop', 'Управление блоками')}</span>
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Keyboard size={14} />
            <span>{t('notesHelp.shortcuts')}</span>
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image size={14} />
            <span>{t('notesHelp.media')}</span>
          </TabsTrigger>
          <TabsTrigger value="tree">
            <FolderTree size={14} />
            <span>{t('notesHelp.page-tree', 'Дерево страниц')}</span>
          </TabsTrigger>
        </TabsList>

        <div className="notes-help-content">
          <TabsContent value="slash">
            <>
              <p className="notes-help-lead">
                {t(
                  'notesHelp.type-in-any-block-to-quickly-insert-headers-list',
                  'Нажмите символ / в любой строке, чтобы быстро выбрать и превратить блок в заголовок, список, цитату, выноску или медиа. Начните вводить текст после слэша для мгновенного поиска.',
                )}
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
          </TabsContent>

          <TabsContent value="blocks">
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <GripVertical size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.six-dots-handle-drag-drop', 'Ручка из 6 точек (Drag-and-Drop)')}</strong>
                  <p>
                    {t(
                      'notesHelp.hover-over-any-block-on-the-left-to-reveal-the-6',
                      'При наведении курсора на блок слева появляется ручка с 6 точками. Зажмите её левой кнопкой мыши и перетащите блок на любое новое место.',
                    )}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Sparkles size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.block-actions-menu', 'Меню блока (···)')}</strong>
                  <p>
                    {t(
                      'notesHelp.use-the-block-action-menu-to-duplicate-a-block-o',
                      'Через меню действий можно дублировать текущий блок со всем содержимым или удалить его. Кнопка + слева быстро вставляет новый блок под текущим.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keys">
            <div className="notes-help-feature-list">
              {shortcuts.map((sc) => (
                <div key={sc.key} className="notes-help-shortcut-row">
                  <span className="notes-help-key">{sc.key}</span>
                  <span className="notes-help-card-desc">{sc.desc}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Image size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.drag-drop-files', 'Перетаскивание файлов прямо в окно')}</strong>
                  <p>
                    {t(
                      'notesHelp.you-can-drag-images-audio-tracks-and-pdf-documen',
                      'Перетащите файл картинки, аудиозаписи или PDF-документа из папки на компьютере прямо в окно заметки. Блок создастся автоматически.',
                    )}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Keyboard size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.clipboard-paste-ctrl-v', 'Вставка скриншота из буфера (Ctrl+V)')}</strong>
                  <p>
                    {t(
                      'notesHelp.take-a-screenshot-with-printscreen-or-snipping-t',
                      'Сделайте скриншот экрана и нажмите Ctrl+V прямо в редакторе — изображение сразу появится как блок картинки.',
                    )}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <FileText size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.built-in-preview-players', 'Встроенный плеер и просмотр PDF')}</strong>
                  <p>
                    {t(
                      'notesHelp.audio-files-have-a-full-playback-controller-pdf-',
                      'Для аудио файлов доступен встроенный аудиоплеер, а для PDF — удобный предпросмотр документа и скачивание в один клик.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tree">
            <div className="notes-help-feature-list">
              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <FolderTree size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.infinite-nesting', 'Бесконечная вложенность')}</strong>
                  <p>
                    {t(
                      'notesHelp.create-subpages-inside-any-note-like-computer-fo',
                      'Создавайте страницы внутри других страниц на любую глубину. Нажмите + у любой заметки в боковом меню, чтобы создать дочернюю страницу.',
                    )}
                  </p>
                </div>
              </div>

              <div className="notes-help-feature-item">
                <span className="notes-help-feature-icon">
                  <Command size={16} />
                </span>
                <div className="notes-help-feature-body">
                  <strong>{t('notesHelp.moving-pages-breadcrumbs', 'Перемещение страниц и навигация')}</strong>
                  <p>
                    {t(
                      'notesHelp.use-the-move-button-in-the-breadcrumb-trail-to-r',
                      'Кнопка «Переместить» в цепочке навигации вверху позволяет сменить родительскую страницу в любой момент.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>

        <div className="notes-help-footer">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('notesHelp.got-it', 'Понятно')}
          </Button>
        </div>
      </Tabs>
    </Modal>
  )
}

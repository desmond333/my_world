import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Check, ChevronRight, Compass, Crown, Feather, Heart, NotebookPen, Plus, Search, Sparkles, Wind, Zap } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { storage } from '../../lib'
import { useDailyStore, useNotesStore, useProductivityStore, type ViewMode } from '../../store'
import { playCatMeow, playCatPurr } from './catAudio'

const PET_COUNT_KEY = 'myworld_cat_pet_count'

type CatTarget = { path: string; key: string; hint: string; category?: string }

type CatPremiumPanelProps = {
  targets: CatTarget[]
  activePath: string
  currentMode: ViewMode
  onToggleMode: () => void
  onClose: () => void
  onPet: () => void
  isPetting: boolean
}

type TabType = 'actions' | 'brief' | 'nav'

const CAT_ORACLES = {
  ru: [
    'Сегодня идеальный день, чтобы потянуться, сладко зевнуть и перевернуть горы.',
    'Твои планы сбудутся, если ты не будешь суетиться и сохранишь кошачью грацию.',
    'Интуиция сегодня острая как коготки — доверяй первому впечатлению.',
    'Сделай одно важное дело прямо сейчас, а потом устрой себе королевский отдых.',
    'Вселенная готовит приятный сюрприз. Главное — не проспать его!',
    'Если что-то идёт не по плану — посмотри на это с высоты шкафа. Всё решаемо.',
    'Сегодня кто-то мысленно благодарит тебя за твою поддержку и тепло.',
  ],
  en: [
    'Today is the perfect day to stretch, yawn luxuriously, and conquer mountains.',
    'Your goals will succeed if you remain calm and move with feline poise.',
    'Your intuition is sharp like claws today — trust your first instinct.',
    'Tackle one critical task right now, then treat yourself like royalty.',
    'The universe is preparing a lovely surprise. Just don’t nap through it!',
    'If something goes off-script, view it from above like a cat on a bookshelf. You got this.',
    'Someone is quietly grateful today for your warmth and care.',
  ],
}

const CAT_WISDOM = {
  ru: [
    '«Спи крепко, охоться метко, люби себя безусловно.»',
    '«Сложную задачу лучше разбить на маленькие кусочки, как лакомство.»',
    '«Лучший отдых — это когда совесть чиста, а задачи в списке вычеркнуты.»',
  ],
  en: [
    '“Sleep deeply, strike accurately, love yourself unconditionally.”',
    '“Break complex tasks into small bite-sized pieces, like treats.”',
    '“The purest rest comes when your conscience is clear and tasks are checked.”',
  ],
}

export const CatPremiumPanel = ({ targets, activePath, currentMode, onToggleMode, onClose, onPet, isPetting }: CatPremiumPanelProps) => {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('actions')
  const [petCount, setPetCount] = useState<number>(() => storage.get<number>(PET_COUNT_KEY, 0))
  const [searchQuery, setSearchQuery] = useState('')

  const [taskInput, setTaskInput] = useState('')
  const [taskSuccess, setTaskSuccess] = useState(false)

  const [noteInput, setNoteInput] = useState('')
  const [noteSuccess, setNoteSuccess] = useState(false)

  const [oracleText, setOracleText] = useState<string | null>(null)
  const [isRelaxing, setIsRelaxing] = useState(false)

  const productivityItems = useProductivityStore((state) => state.items)
  const addTask = useProductivityStore((state) => state.add)
  const addNote = useNotesStore((state) => state.add)
  const cityId = useDailyStore((state) => state.cityId)

  const pendingTasksCount = useMemo(
    () => productivityItems.filter((item) => item.kind === 'task' && !item.done).length,
    [productivityItems],
  )

  const handlePetCat = () => {
    onPet()
    playCatPurr()
    const nextCount = petCount + 1
    setPetCount(nextCount)
    storage.set(PET_COUNT_KEY, nextCount)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskInput.trim()) return
    const todayStr = new Date().toISOString().slice(0, 10)
    addTask('task', taskInput.trim(), todayStr)
    setTaskInput('')
    setTaskSuccess(true)
    playCatMeow()
    setTimeout(() => setTaskSuccess(false), 2200)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteInput.trim()) return
    addNote('note', {
      title: noteInput.trim().slice(0, 40),
      body: noteInput.trim(),
    })
    setNoteInput('')
    setNoteSuccess(true)
    playCatMeow()
    setTimeout(() => setNoteSuccess(false), 2200)
  }

  const handleAskOracle = () => {
    playCatMeow()
    const list = lang === 'en' ? CAT_ORACLES.en : CAT_ORACLES.ru
    const rand = list[Math.floor(Math.random() * list.length)]
    setOracleText(rand)
  }

  const toggleRelax = () => {
    if (!isRelaxing) {
      playCatPurr()
      setIsRelaxing(true)
    } else {
      setIsRelaxing(false)
    }
  }

  const filteredTargets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return targets
    return targets.filter((tgt) => t(tgt.key).toLowerCase().includes(q) || t(tgt.hint).toLowerCase().includes(q))
  }, [targets, searchQuery, t])

  const wisdomIndex = useMemo(() => new Date().getDate() % 3, [])
  const dailyWisdom = (lang === 'en' ? CAT_WISDOM.en : CAT_WISDOM.ru)[wisdomIndex]

  return (
    <div className="cat-premium-panel" role="dialog" aria-label={t('cat.aria')}>
      <div className="cat-premium-header">
        <div className="cat-premium-meta">
          <div className="cat-premium-badge">
            <Crown size={12} className="cat-crown-icon" />
            <span>{t('cat.status.royal')}</span>
          </div>

          <button type="button" className="cat-mode-switch-btn" onClick={onToggleMode} title={t('cat.mode.tooltip')}>
            {currentMode === 'normal' ? (
              <>
                <Feather size={12} />
                <span>{t('cat.mode.simple')}</span>
              </>
            ) : (
              <>
                <Crown size={12} />
                <span>{t('cat.mode.normal')}</span>
              </>
            )}
          </button>
        </div>

        <div className="cat-pet-row">
          <div className="cat-happiness-indicator">
            <Heart size={12} className="cat-heart-pulse" />
            <span>
              {t('cat.happiness')}: 100% · {petCount} {t('cat.times')}
            </span>
          </div>

          <button type="button" className={`cat-pet-btn ${isPetting ? 'is-petting' : ''}`} onClick={handlePetCat}>
            <Sparkles size={12} />
            <span>{isPetting ? t('cat.petted') : t('cat.pet')}</span>
          </button>
        </div>
      </div>

      <nav className="cat-premium-tabs">
        <button
          type="button"
          className={`cat-tab-btn ${activeTab === 'actions' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <Zap size={13} />
          <span>{t('cat.tab.actions')}</span>
        </button>

        <button type="button" className={`cat-tab-btn ${activeTab === 'brief' ? 'is-active' : ''}`} onClick={() => setActiveTab('brief')}>
          <Calendar size={13} />
          <span>{t('cat.tab.brief')}</span>
        </button>

        <button type="button" className={`cat-tab-btn ${activeTab === 'nav' ? 'is-active' : ''}`} onClick={() => setActiveTab('nav')}>
          <Compass size={13} />
          <span>{t('cat.tab.nav')}</span>
        </button>
      </nav>

      <div className="cat-premium-content">
        {activeTab === 'actions' && (
          <div className="cat-actions-view">
            <div className="cat-action-card">
              <label htmlFor="cat-quick-task" className="cat-action-label">
                <Check size={13} /> {t('cat.action.quickTask')}
              </label>
              <form onSubmit={handleAddTask} className="cat-input-row">
                <input
                  id="cat-quick-task"
                  type="text"
                  className="cat-quick-input"
                  placeholder={t('cat.action.quickTaskPlaceholder')}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                />
                <button type="submit" className="cat-submit-btn" disabled={!taskInput.trim()}>
                  <Plus size={14} />
                </button>
              </form>
              {taskSuccess && <p className="cat-success-msg">{t('cat.action.taskAdded')}</p>}
            </div>

            <div className="cat-action-card">
              <label htmlFor="cat-quick-note" className="cat-action-label">
                <NotebookPen size={13} /> {t('cat.action.quickNote')}
              </label>
              <form onSubmit={handleAddNote} className="cat-input-row">
                <input
                  id="cat-quick-note"
                  type="text"
                  className="cat-quick-input"
                  placeholder={t('cat.action.quickNotePlaceholder')}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
                <button type="submit" className="cat-submit-btn" disabled={!noteInput.trim()}>
                  <Plus size={14} />
                </button>
              </form>
              {noteSuccess && <p className="cat-success-msg">{t('cat.action.noteAdded')}</p>}
            </div>

            <div className="cat-action-card cat-oracle-card">
              <div className="cat-card-head">
                <span className="cat-action-label">
                  <Sparkles size={13} /> {t('cat.action.oracle')}
                </span>
                <button type="button" className="cat-pill-action" onClick={handleAskOracle}>
                  {t('cat.action.oracleAsk')}
                </button>
              </div>
              {oracleText && <p className="cat-oracle-text">«{oracleText}»</p>}
            </div>

            <div className={`cat-action-card cat-relax-card ${isRelaxing ? 'is-active' : ''}`}>
              <div className="cat-card-head">
                <span className="cat-action-label">
                  <Wind size={13} /> {t('cat.action.relax')}
                </span>
                <button type="button" className="cat-pill-action" onClick={toggleRelax}>
                  {isRelaxing ? t('cat.action.relaxStop') : 'Старт'}
                </button>
              </div>
              {isRelaxing && (
                <div className="cat-relax-animation">
                  <div className="cat-relax-circle" />
                  <p className="cat-relax-text">{t('cat.action.relaxing')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'brief' && (
          <div className="cat-brief-view">
            <div className="cat-brief-item">
              <div className="cat-brief-icon">⚡</div>
              <div className="cat-brief-info">
                <strong>{t('cat.brief.tasksLeft')}</strong>
                <p>
                  {pendingTasksCount > 0 ? (
                    `${pendingTasksCount} ${lang === 'en' ? 'pending' : 'в процессе'}`
                  ) : (
                    <span className="cat-done-pill">{t('cat.brief.noTasks')}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="cat-brief-link"
                onClick={() => {
                  onClose()
                  navigate('/extra/productivity/task')
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="cat-brief-item">
              <div className="cat-brief-icon">🌍</div>
              <div className="cat-brief-info">
                <strong>{t('cat.brief.today')}</strong>
                <p className="cat-brief-city">{cityId}</p>
              </div>
              <button
                type="button"
                className="cat-brief-link"
                onClick={() => {
                  onClose()
                  navigate('/today')
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="cat-brief-item cat-wisdom-item">
              <div className="cat-brief-icon">🐾</div>
              <div className="cat-brief-info">
                <strong>{t('cat.brief.quoteTitle')}</strong>
                <p className="cat-wisdom-text">{dailyWisdom}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nav' && (
          <div className="cat-nav-view">
            <div className="cat-search-box">
              <Search size={13} className="cat-search-icon" />
              <input
                type="text"
                className="cat-search-input"
                placeholder={lang === 'en' ? 'Search sections...' : 'Поиск по разделам...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ul className="cat-nav-list">
              {filteredTargets.map((target) => {
                const active = target.path === activePath
                return (
                  <li key={target.path}>
                    <button
                      type="button"
                      className={`cat-panel__item ${active ? 'is-active' : ''}`}
                      onClick={() => {
                        onClose()
                        navigate(target.path)
                      }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="cat-panel__label">{t(target.key)}</span>
                      <span className="cat-panel__hint">{t(target.hint)}</span>
                      <ChevronRight size={13} className="cat-panel__arrow" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

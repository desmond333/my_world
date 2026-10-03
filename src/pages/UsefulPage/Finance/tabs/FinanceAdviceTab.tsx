import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Crown, Flame, ShieldCheck, Sparkles } from 'lucide-react'
import { CatFace } from '../../../../widgets'
import { PremiumGate, Tabs, TabsList, TabsTrigger } from '../../../../shared/ui'
import { useTranslation } from '../../../../lib/i18n'
import { useFeature } from '../../../../hooks'
import { ADVICE_ITEMS, type AdviceCategory, type AdviceItem } from '../adviceData'
import './FinanceAdvice.css'

type AdviceTabKey = 'all' | AdviceCategory

type AdviceTabDef = {
  id: AdviceTabKey
  key: string
  icon: typeof Sparkles
  mood: 'idle' | 'happy'
  fur: string
}

const ADVICE_TABS: AdviceTabDef[] = [
  { id: 'all', key: 'finance.advice.tab.all', icon: Sparkles, mood: 'happy', fur: '#f0c07a' },
  { id: 'careful', key: 'finance.advice.tab.careful', icon: ShieldCheck, mood: 'idle', fur: '#b9c7d6' },
  { id: 'curious', key: 'finance.advice.tab.curious', icon: Compass, mood: 'happy', fur: '#f0c07a' },
  { id: 'brave', key: 'finance.advice.tab.brave', icon: Flame, mood: 'happy', fur: '#e0906a' },
]

const FREE_COUNT = 3

export const FinanceAdviceTab = () => {
  const { lang, t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdviceTabKey>('all')

  const unlocked = useFeature('finance.advice').unlocked

  const currentTabDef = ADVICE_TABS.find((item) => item.id === activeTab) ?? ADVICE_TABS[0]

  const catStyle = {
    '--cat-fur': currentTabDef.fur,
    '--cat-inner': '#e88b8b',
    '--cat-line': '#3a2b1e',
    '--cat-nose': '#d9748a',
    '--cat-blush': 'rgba(226, 120, 106, 0.32)',
  } as CSSProperties

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return ADVICE_ITEMS
    return ADVICE_ITEMS.filter((item) => item.category === activeTab)
  }, [activeTab])

  const freeItems = useMemo(() => {
    if (activeTab === 'all') return filteredItems.slice(0, FREE_COUNT)
    return filteredItems.slice(0, 1)
  }, [filteredItems, activeTab])

  const premiumItems = useMemo(() => {
    if (activeTab === 'all') return filteredItems.slice(FREE_COUNT)
    return filteredItems.slice(1)
  }, [filteredItems, activeTab])

  const renderCard = (item: AdviceItem): ReactNode => {
    const categoryKey = `finance.advice.tab.${item.category}`
    const categoryFur = item.category === 'careful' ? '#b9c7d6' : item.category === 'brave' ? '#e0906a' : '#f0c07a'
    const miniCatStyle = {
      '--cat-fur': categoryFur,
      '--cat-inner': '#e88b8b',
      '--cat-line': '#3a2b1e',
      '--cat-nose': '#d9748a',
      '--cat-blush': 'rgba(226, 120, 106, 0.32)',
    } as CSSProperties

    return (
      <article key={item.id} className="advice-card">
        <div className="advice-card-head">
          <div className="advice-card-head-left">
            <span className="advice-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <h4>{item.title[lang]}</h4>
          </div>
          <span className={`advice-category-badge is-${item.category}`}>{t(categoryKey)}</span>
        </div>

        <div className="advice-pair">
          <div className="advice-note is-bad">
            <span className="advice-note-label">{t('finance.advice.bad')}</span>
            <p>{item.bad[lang]}</p>
          </div>
          <div className="advice-note is-good">
            <span className="advice-note-label">{t('finance.advice.good')}</span>
            <p>{item.good[lang]}</p>
          </div>
        </div>

        <p className="advice-why">
          <strong>{t('finance.advice.why')}:</strong> {item.why[lang]}
        </p>

        <div className="advice-timka-box">
          <div className="advice-timka-head">
            <div className="advice-timka-avatar" style={miniCatStyle}>
              <CatFace size={24} mood={item.category === 'careful' ? 'idle' : 'happy'} />
            </div>
            <span>{t('finance.advice.kittenStory')}</span>
          </div>
          <p className="advice-timka-story">«{item.timkaStory[lang]}»</p>
        </div>
      </article>
    )
  }

  return (
    <div className="finance-advice">
      <header className="advice-hero">
        <div className="advice-cat" style={catStyle}>
          <CatFace size={84} mood={currentTabDef.mood} />
        </div>
        <div className="advice-hero-text">
          <div className="advice-hero-badges">
            <span className="advice-pill">
              <Crown size={12} />
              {t('finance.advice.premiumBadge')}
            </span>
            <span className="advice-kitten-name">{t('finance.advice.kitten')}</span>
          </div>
          <h3>{t('finance.advice.title')}</h3>
          <p className="advice-intro-lead">{t('finance.advice.intro')}</p>

          <div className="advice-speech-bubble">
            <p className="advice-speech-text">«{t(`finance.advice.speech.${activeTab}`)}»</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (val) setActiveTab(val as AdviceTabKey)
            }}
            className="advice-nav-tabs"
          >
            <TabsList aria-label={t('finance.advice.tabsAria')}>
              {ADVICE_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <Icon size={14} />
                    <span>{t(tab.key)}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="advice-grid">{freeItems.map(renderCard)}</div>

      {!unlocked && <p className="advice-free-hint">{t('finance.advice.freeHint')}</p>}

      <PremiumGate
        locked={!unlocked}
        title={t('finance.advice.premiumTitle')}
        description={t('finance.advice.premiumDesc', undefined, { count: premiumItems.length })}
        actionLabel={t('finance.advice.premiumCta')}
        onAction={() => navigate('/shop')}
      >
        <div className="advice-grid">{premiumItems.map(renderCard)}</div>
      </PremiumGate>
    </div>
  )
}

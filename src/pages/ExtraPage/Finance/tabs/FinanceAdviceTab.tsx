import { useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { CatFace } from '../../../../widgets'
import { PremiumGate } from '../../../../shared/ui'
import { useTranslation } from '../../../../lib/i18n'
import { useAuthStore, usePremiumStore } from '../../../../store'
import { ADVICE_ITEMS, type AdviceItem } from '../adviceData'
import './FinanceAdvice.css'

type Persona = {
  id: 'curious' | 'careful' | 'brave'
  key: string
  fur: string
  mood: 'idle' | 'happy'
}

const PERSONAS: Persona[] = [
  { id: 'curious', key: 'finance.advice.persona.curious', fur: '#f0c07a', mood: 'happy' },
  { id: 'careful', key: 'finance.advice.persona.careful', fur: '#b9c7d6', mood: 'idle' },
  { id: 'brave', key: 'finance.advice.persona.brave', fur: '#e0906a', mood: 'happy' },
]

const FREE_COUNT = 3

export const FinanceAdviceTab = () => {
  const { lang, t } = useTranslation()
  const navigate = useNavigate()
  const [personaId, setPersonaId] = useState<Persona['id']>('curious')
  const unlockedLocally = usePremiumStore((state) => state.isUnlocked('financeAdvice'))
  const accountPremium = useAuthStore((state) => state.user?.premium ?? false)
  const unlocked = accountPremium || unlockedLocally

  const persona = PERSONAS.find((item) => item.id === personaId) ?? PERSONAS[0]

  const catStyle = {
    '--cat-fur': persona.fur,
    '--cat-inner': '#e88b8b',
    '--cat-line': '#3a2b1e',
    '--cat-nose': '#d9748a',
    '--cat-blush': 'rgba(226, 120, 106, 0.32)',
  } as CSSProperties

  const renderCard = (item: AdviceItem): ReactNode => (
    <article key={item.id} className="advice-card">
      <div className="advice-card-head">
        <span className="advice-emoji" aria-hidden="true">
          {item.emoji}
        </span>
        <h4>{item.title[lang]}</h4>
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
    </article>
  )

  const freeItems = ADVICE_ITEMS.slice(0, FREE_COUNT)
  const premiumItems = ADVICE_ITEMS.slice(FREE_COUNT)

  return (
    <div className="finance-advice">
      <header className="advice-hero">
        <div className="advice-cat" style={catStyle}>
          <CatFace size={84} mood={persona.mood} />
        </div>
        <div className="advice-hero-text">
          <span className="advice-pill">
            <Crown size={12} />
            {t('finance.advice.premiumBadge')}
          </span>
          <span className="advice-kitten-name">{t('finance.advice.kitten')}</span>
          <h3>{t('finance.advice.title')}</h3>
          <p>{t('finance.advice.intro')}</p>

          <div className="advice-personas" role="group" aria-label={t('finance.advice.personaLabel')}>
            {PERSONAS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`advice-persona-btn ${item.id === personaId ? 'is-on' : ''}`}
                onClick={() => setPersonaId(item.id)}
              >
                {t(item.key)}
              </button>
            ))}
          </div>
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

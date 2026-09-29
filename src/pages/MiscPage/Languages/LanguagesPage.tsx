import { useSearchParams } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { GeorgianTab } from './georgian/GeorgianTab'
import { EnglishTab } from './english/EnglishTab'
import './LanguagesPage.css'

export type LanguageSubTab = 'english' | 'georgian'

export const LanguagesPage = () => {
  const { lang, t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = (searchParams.get('tab') as LanguageSubTab) || 'english'

  const setTab = (tab: LanguageSubTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <div className="languages-page">
      {/* Top Header */}
      <header className="languages-header">
        <div className="languages-header-left">
          <div className="languages-badge">
            <Languages size={15} />
            <span>{t('langPage.title')}</span>
          </div>
          <h2 className="languages-title">{t('langPage.title')}</h2>
          <p className="languages-subtitle">{currentTab === 'english' ? t('langPage.englishDesc') : t('langPage.georgianDesc')}</p>
        </div>
      </header>

      {/* Main Sub-Tabs Navigation */}
      <div className="languages-nav-tabs" role="tablist" aria-label="Языки обучения">
        <button
          type="button"
          role="tab"
          aria-selected={currentTab === 'english'}
          className={`languages-tab-btn ${currentTab === 'english' ? 'active' : ''}`}
          onClick={() => setTab('english')}
        >
          <span className="lang-flag" aria-hidden="true">
            🇺🇸
          </span>
          <span className="lang-tab-text">
            <strong>{lang === 'ru' ? 'Английский' : 'English'}</strong>
            <small>{lang === 'ru' ? 'YouTube & Пресса' : 'YouTube & Press'}</small>
          </span>
          <span className="lang-tab-badge">Advanced</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentTab === 'georgian'}
          className={`languages-tab-btn ${currentTab === 'georgian' ? 'active' : ''}`}
          onClick={() => setTab('georgian')}
        >
          <span className="lang-flag" aria-hidden="true">
            🇬🇪
          </span>
          <span className="lang-tab-text">
            <strong>{lang === 'ru' ? 'Грузинский' : 'Georgian'}</strong>
            <small>{lang === 'ru' ? 'Разговорник & Звуки' : 'Phrasebook & Audio'}</small>
          </span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="languages-content">{currentTab === 'english' ? <EnglishTab /> : <GeorgianTab />}</div>
    </div>
  )
}

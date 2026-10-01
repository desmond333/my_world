import { useSearchParams } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { GeorgianTab } from './georgian/GeorgianTab'
import { EnglishTab } from './english/EnglishTab'
import { BasicEnglishTab } from './basicEnglish/BasicEnglishTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui'
import './LanguagesPage.css'

export type LanguageSubTab = 'basicEnglish' | 'english' | 'georgian'

const DEFAULT_TAB: LanguageSubTab = 'basicEnglish'

const isLanguageSubTab = (value: string | null): value is LanguageSubTab =>
  value === 'basicEnglish' || value === 'english' || value === 'georgian'

export const LanguagesPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const currentTab: LanguageSubTab = isLanguageSubTab(tabParam) ? tabParam : DEFAULT_TAB

  const setTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true })
  }

  const subtitleKey =
    currentTab === 'basicEnglish'
      ? 'langPage.basicEnglishDesc'
      : currentTab === 'english'
        ? 'langPage.englishDesc'
        : 'langPage.georgianDesc'

  return (
    <div className="languages-page">
      <header className="languages-header">
        <div className="languages-header-left">
          <div className="languages-badge">
            <Languages size={15} />
            <span>{t('langPage.title')}</span>
          </div>
          <h2 className="languages-title">{t('langPage.title')}</h2>
          <p className="languages-subtitle">{t(subtitleKey)}</p>
        </div>
      </header>

      <Tabs value={currentTab} onValueChange={setTab}>
        <TabsList className="languages-nav-tabs" aria-label={t('langPage.tabsAria')}>
          <TabsTrigger value="basicEnglish" className={`languages-tab-btn ${currentTab === 'basicEnglish' ? 'active' : ''}`}>
            <span className="lang-flag" aria-hidden="true">
              🇬🇧
            </span>
            <span className="lang-tab-text">
              <strong>{t('langPage.basicEnglishName')}</strong>
              <small>{t('langPage.basicEnglishHint')}</small>
            </span>
            <span className="lang-tab-badge">Basic</span>
          </TabsTrigger>

          <TabsTrigger value="english" className={`languages-tab-btn ${currentTab === 'english' ? 'active' : ''}`}>
            <span className="lang-flag" aria-hidden="true">
              🇺🇸
            </span>
            <span className="lang-tab-text">
              <strong>{t('langPage.englishName')}</strong>
              <small>{t('langPage.englishHint')}</small>
            </span>
            <span className="lang-tab-badge">Advanced</span>
          </TabsTrigger>

          <TabsTrigger value="georgian" className={`languages-tab-btn ${currentTab === 'georgian' ? 'active' : ''}`}>
            <span className="lang-flag" aria-hidden="true">
              🇬🇪
            </span>
            <span className="lang-tab-text">
              <strong>{t('langPage.georgianName')}</strong>
              <small>{t('langPage.georgianHint')}</small>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basicEnglish" className="languages-content">
          <BasicEnglishTab />
        </TabsContent>
        <TabsContent value="english" className="languages-content">
          <EnglishTab />
        </TabsContent>
        <TabsContent value="georgian" className="languages-content">
          <GeorgianTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

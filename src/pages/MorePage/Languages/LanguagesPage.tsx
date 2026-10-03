import { useSearchParams } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { FeatureGate } from '../../../features'
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
        <TabsList aria-label={t('langPage.tabsAria')}>
          <TabsTrigger value="basicEnglish">
            <span aria-hidden="true">🇬🇧</span> {t('langPage.basicEnglishName')}
          </TabsTrigger>
          <TabsTrigger value="english">
            <span aria-hidden="true">🇺🇸</span> {t('langPage.englishName')}
          </TabsTrigger>
          <TabsTrigger value="georgian">
            <span aria-hidden="true">🇬🇪</span> {t('langPage.georgianName')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basicEnglish" className="languages-content">
          <BasicEnglishTab />
        </TabsContent>
        <TabsContent value="english" className="languages-content">
          <FeatureGate feature="languages.advanced">
            <EnglishTab />
          </FeatureGate>
        </TabsContent>
        <TabsContent value="georgian" className="languages-content">
          <GeorgianTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

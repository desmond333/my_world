import { useTranslation } from '../../../../lib/i18n'
import { ENGLISH_CATEGORIES, ENGLISH_WORDS } from './englishData'
import { READING_ARTICLES } from './readingData'
import { EnglishModuleTab } from './EnglishModuleTab'

export const EnglishTab = () => {
  const { t } = useTranslation()

  return (
    <EnglishModuleTab
      words={ENGLISH_WORDS}
      categories={ENGLISH_CATEGORIES}
      articles={READING_ARTICLES}
      storageKeyPrefix="english"
      heroBadge={t('lang.en.heroBadge')}
      heroTitle={t('lang.en.heroTitle')}
      heroDesc={t('lang.en.heroDesc')}
      trainerTitle={t('lang.en.trainerTitle')}
    />
  )
}

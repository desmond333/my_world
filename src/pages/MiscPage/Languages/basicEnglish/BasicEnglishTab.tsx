import { useTranslation } from '../../../../lib/i18n'
import { EnglishModuleTab } from '../english/EnglishModuleTab'
import { BASIC_CATEGORIES, BASIC_WORDS } from './basicEnglishData'
import { BASIC_READING_ARTICLES, BASIC_READING_CATEGORIES } from './basicReadingData'

export const BasicEnglishTab = () => {
  const { t } = useTranslation()

  return (
    <EnglishModuleTab
      words={BASIC_WORDS}
      categories={BASIC_CATEGORIES}
      articles={BASIC_READING_ARTICLES}
      readingCategories={BASIC_READING_CATEGORIES}
      storageKeyPrefix="basic-english"
      heroBadge="Basic English for Beginners"
      heroTitle={t('lang.basic.heroTitle')}
      heroDesc={t('lang.basic.heroDesc')}
      trainerTitle="Basic English Trainer"
    />
  )
}

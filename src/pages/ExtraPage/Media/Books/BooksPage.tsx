import { BookOpen } from 'lucide-react'
import { ComingSoon } from '../../../../components/ComingSoon/ComingSoon'
import { useTranslation } from '../../../../lib/i18n'

export const BooksPage = () => {
  const { t } = useTranslation()

  return <ComingSoon icon={BookOpen} kicker={t('media.books.kicker')} heading={t('media.tab.books')} description={t('media.books.desc')} />
}

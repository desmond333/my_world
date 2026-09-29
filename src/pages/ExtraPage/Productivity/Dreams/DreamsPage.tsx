import { useTranslation } from '../../../../lib/i18n'
import { ProductivityList } from '../ProductivityList'

export const DreamsPage = () => {
  const { t } = useTranslation()

  return (
    <ProductivityList
      kind="dream"
      fieldLabel={t('productivity.dream.field')}
      placeholder={t('productivity.dream.placeholder')}
      empty={t('productivity.dream.empty')}
    />
  )
}

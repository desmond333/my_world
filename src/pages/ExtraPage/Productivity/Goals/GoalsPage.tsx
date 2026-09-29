import { useTranslation } from '../../../../lib/i18n'
import { ProductivityList } from '../ProductivityList'

export const GoalsPage = () => {
  const { t } = useTranslation()

  return (
    <ProductivityList
      kind="goal"
      fieldLabel={t('productivity.goal.field')}
      placeholder={t('productivity.goal.placeholder')}
      empty={t('productivity.goal.empty')}
    />
  )
}

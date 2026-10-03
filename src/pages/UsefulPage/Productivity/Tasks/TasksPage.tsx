import { useTranslation } from '../../../../lib/i18n'
import { ProductivityList } from '../ProductivityList'

export const TasksPage = () => {
  const { t } = useTranslation()

  return (
    <ProductivityList
      kind="task"
      fieldLabel={t('productivity.task.field')}
      placeholder={t('productivity.task.placeholder')}
      empty={t('productivity.task.empty')}
    />
  )
}

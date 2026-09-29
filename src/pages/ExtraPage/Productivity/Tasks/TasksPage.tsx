import { useTranslation } from '../../../../lib/i18n'
import { ProductivityList } from '../ProductivityList'

export const TasksPage = () => {
  const { lang } = useTranslation()

  return (
    <ProductivityList
      kind="task"
      fieldLabel={lang === 'en' ? 'New task' : 'Новая задача'}
      placeholder={lang === 'en' ? 'What needs to be done today?' : 'Что нужно сделать сегодня?'}
      empty={
        lang === 'en'
          ? 'No tasks yet. Add the first one — you will earn 10 points.'
          : 'Задач пока нет. Добавь первую — за неё дадут 10 баллов.'
      }
    />
  )
}

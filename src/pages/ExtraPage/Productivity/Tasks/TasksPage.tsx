import { ProductivityList } from '../ProductivityList'

export const TasksPage = () => (
  <ProductivityList
    kind="task"
    fieldLabel="Новая задача"
    placeholder="Что нужно сделать сегодня?"
    empty="Задач пока нет. Добавь первую — за неё дадут 10 баллов."
  />
)

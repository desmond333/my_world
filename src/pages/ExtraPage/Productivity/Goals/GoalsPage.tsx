import { ProductivityList } from '../ProductivityList'

export const GoalsPage = () => (
  <ProductivityList
    kind="goal"
    fieldLabel="Новая цель"
    placeholder="Цель на ближайший месяц"
    empty="Целей пока нет. Добавь первую — за неё дадут 100 баллов."
  />
)

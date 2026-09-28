import { ProductivityList } from '../ProductivityList'

export const DreamsPage = () => (
  <ProductivityList
    kind="dream"
    fieldLabel="Новая мечта"
    placeholder="О чём мечтаешь?"
    empty="Мечт пока нет. Добавь первую — за неё дадут 1000 баллов."
  />
)

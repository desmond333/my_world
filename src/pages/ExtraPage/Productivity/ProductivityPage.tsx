import { Outlet } from 'react-router-dom'
import { Target } from 'lucide-react'
import { SectionTabs } from '../../../components/SectionTabs/SectionTabs'
import { productivityTabs, toProductivityTab } from './productivityTabs'
import './Productivity.css'

export const ProductivityPage = () => (
  <>
    <section className="extra-head">
      <p className="eyebrow">
        <Target size={15} /> дополнительно · продуктивность
      </p>
      <h1>Продуктивность</h1>
      <p className="intro">Задачи, цели и мечты. Каждое выполненное дело приносит баллы, а баллы каждого месяца остаются в статистике.</p>
    </section>
    <section className="extra-section">
      <SectionTabs tabs={productivityTabs.map(toProductivityTab)} label="Разделы продуктивности" variant="sub" />
      <Outlet />
    </section>
  </>
)

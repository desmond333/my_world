import { Outlet } from 'react-router-dom'
import { SectionTabs } from '../../../components/SectionTabs/SectionTabs'
import { mediaTabs, toMediaTab } from './mediaTabs'

export const MediaPage = () => (
  <section className="extra-section">
    <SectionTabs tabs={mediaTabs.map(toMediaTab)} label="Разделы медиа" variant="sub" />
    <Outlet />
  </section>
)

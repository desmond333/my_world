import { MonitorSmartphone, Thermometer } from 'lucide-react'
import { CreatorNote } from '../../components/CreatorNote/CreatorNote'

export const DesktopHint = () => (
  <p className="desktop-hint">
    <MonitorSmartphone size={17} />
    <span>Всё это работает и без интернета: фотографии, отметки тренировок, деньги и списки лежат прямо на телефоне.</span>
  </p>
)

export const DailyFooter = () => (
  <footer>
    <span>новый день — новое знакомство</span>
    <span className="footer-note">
      <Thermometer size={14} /> данные обновляются сами
    </span>
    <CreatorNote />
  </footer>
)

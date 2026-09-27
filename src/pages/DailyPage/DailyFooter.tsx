import { MonitorSmartphone, Thermometer } from 'lucide-react'

export const DesktopHint = () => (
  <p className="desktop-hint">
    <MonitorSmartphone size={17} />
    <span>
      Кстати, с компьютера здесь больше простора: фотография крупнее, а про животное — целая страница. Загляни, когда будет настроение.
    </span>
  </p>
)

export const DailyFooter = () => (
  <footer>
    <span>новый день — новое знакомство</span>
    <span className="footer-note">
      <Thermometer size={14} /> данные обновляются сами
    </span>
  </footer>
)

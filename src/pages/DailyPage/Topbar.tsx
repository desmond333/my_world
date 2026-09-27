import { Link, NavLink } from 'react-router-dom'
import { Heart, Settings } from 'lucide-react'
import { formatFullDate } from '../../lib'
import type { TopbarProps } from './types'

export const Topbar = ({ city, now, trainingCount, favoritesCount, settingsOpen, onToggleSettings }: TopbarProps) => (
  <header className="topbar">
    <Link className="brand" to="/" aria-label="Животное дня">
      <span className="brand-mark">
        <Heart size={17} fill="currentColor" />
      </span>
      <span>животное дня</span>
    </Link>
    <div className="header-actions">
      <nav className="main-nav" aria-label="Основная навигация">
        <NavLink to="/">Сегодня</NavLink>
        <NavLink to="/training">Тренировки{trainingCount ? ` · ${trainingCount}` : ''}</NavLink>
        <NavLink to="/favorites">Избранное{favoritesCount ? ` · ${favoritesCount}` : ''}</NavLink>
      </nav>
      <div className="date-stamp">
        <span className="live-dot" /> {city.name} · {formatFullDate(now, city.timezone)}
      </div>
      <button className="settings-button" onClick={onToggleSettings} aria-expanded={settingsOpen} aria-controls="settings-panel">
        <Settings size={17} />
        <span>Настроить</span>
      </button>
    </div>
  </header>
)

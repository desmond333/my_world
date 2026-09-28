import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { MainNav } from '../MainNav/MainNav'

export type AppTopbarProps = { children?: ReactNode }

export const AppTopbar = ({ children }: AppTopbarProps) => (
  <header className="topbar">
    <Link className="brand" to="/" aria-label="Животное дня">
      <span className="brand-mark">
        <Heart size={17} fill="currentColor" />
      </span>
      <span>животное дня</span>
    </Link>
    <div className="header-actions">
      <MainNav />
      {children}
    </div>
  </header>
)

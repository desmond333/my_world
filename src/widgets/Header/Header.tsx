import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { MainNav } from './MainNav'
import { TopbarControls } from './TopbarControls'
import './Header.css'

export type HeaderProps = {
  children?: ReactNode
}

export const Header = ({ children }: HeaderProps) => {
  const { t } = useTranslation()

  return (
    <header className="topbar">
      <div className="topbar-main">
        <Link className="brand" to="/today" aria-label={t('brand.title')}>
          <span className="brand-mark">
            <Heart size={17} fill="currentColor" />
          </span>
          <span>{t('brand.title')}</span>
        </Link>
        <div className="header-actions">
          <TopbarControls />
          {children}
        </div>
      </div>
      <MainNav />
    </header>
  )
}

export const AppTopbar = Header

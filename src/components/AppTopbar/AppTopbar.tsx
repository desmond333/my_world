import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { MainNav } from '../MainNav/MainNav'
import { TopbarControls } from '../TopbarControls/TopbarControls'

export type AppTopbarProps = { children?: ReactNode }

export const AppTopbar = ({ children }: AppTopbarProps) => {
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

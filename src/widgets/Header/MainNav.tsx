import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { useFavoritesStore } from '../../store'
import { Badge } from '../../shared/ui'
import './MainNav.css'

export const MainNav = () => {
  const { t } = useTranslation()
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)

  return (
    <nav className="main-nav" aria-label={t('nav.today')}>
      <NavLink to="/today" end>
        {t('nav.today')}
      </NavLink>
      <NavLink to="/favorites">
        {t('nav.favorites')}
        {favoritesCount > 0 && (
          <Badge variant="count" size="sm" className="nav-badge">
            {favoritesCount}
          </Badge>
        )}
      </NavLink>
      <NavLink to="/useful">{t('nav.useful')}</NavLink>
      <NavLink to="/shop">{t('nav.shop')}</NavLink>
      <NavLink to="/help">{t('help.nav')}</NavLink>
    </nav>
  )
}

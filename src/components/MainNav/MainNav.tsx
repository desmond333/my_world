import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore, useFavoritesStore } from '../../store'

export const MainNav = () => {
  const { t } = useTranslation()
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)
  const extraTab = useDailyStore((state) => state.extraTab)

  return (
    <nav className="main-nav" aria-label={t('nav.today')}>
      <NavLink to="/today" end>
        {t('nav.today')}
      </NavLink>
      <NavLink to="/favorites">
        {t('nav.favorites')}
        {favoritesCount > 0 && <span className="nav-badge">{favoritesCount}</span>}
      </NavLink>
      <NavLink to="/notes">{t('nav.notes')}</NavLink>
      <NavLink to="/shop">{t('nav.shop')}</NavLink>
      {extraTab && (
        <>
          <NavLink to="/extra">{t('nav.useful')}</NavLink>
          <NavLink to="/misc">{t('nav.misc')}</NavLink>
        </>
      )}
    </nav>
  )
}

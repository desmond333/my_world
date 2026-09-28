import { NavLink } from 'react-router-dom'
import { useDailyStore, useFavoritesStore, useMoviesStore } from '../../store'

export const MainNav = () => {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)
  const extraTab = useDailyStore((state) => state.extraTab)
  const moviesCount = useMoviesStore((state) => state.wishlist.length + state.watched.length)

  return (
    <nav className="main-nav" aria-label="Основная навигация">
      <NavLink to="/">Сегодня</NavLink>
      <NavLink to="/favorites">Избранное{favoritesCount ? ` · ${favoritesCount}` : ''}</NavLink>
      {extraTab && <NavLink to="/extra">Дополнительно{moviesCount ? ` · ${moviesCount}` : ''}</NavLink>}
    </nav>
  )
}

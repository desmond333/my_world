import { Link, useLocation } from 'react-router-dom'
import { Coins, Crown, Settings, User, Users } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { useAuthStore, useFriendsStore, useShopStore } from '../../store'
import { LangSwitcher } from '../../features/lang-switcher'
import { ThemeSwitcher } from '../../features/theme-switcher'
import { Tooltip } from '../../shared/ui'
import './TopbarControls.css'

export const TopbarControls = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const coins = useShopStore((state) => state.coins)
  const user = useAuthStore((state) => state.user)
  const openFriendsModal = useFriendsStore((state) => state.openModal)
  const incomingRequestsCount = useFriendsStore((state) => state.incoming.length)

  return (
    <div className="topbar-controls">
      <LangSwitcher />
      <ThemeSwitcher />

      <Tooltip content={t('topbar.shopTitle')}>
        <Link to="/shop" className={`shop-link-btn ${location.pathname === '/shop' ? 'is-active' : ''}`} aria-label={t('nav.shop')}>
          <Coins size={14} className="shop-link-icon" />
          <span className="shop-link-coins">{coins.toLocaleString()}</span>
        </Link>
      </Tooltip>

      <Tooltip content={t('friends.title')}>
        <button
          type="button"
          className="settings-link-btn"
          onClick={() => openFriendsModal()}
          aria-label={t('friends.title')}
          style={{ position: 'relative' }}
        >
          <Users size={15} />
          {incomingRequestsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--coral)',
              }}
            />
          )}
        </button>
      </Tooltip>

      <Tooltip content={t('settings.title')}>
        <Link
          to="/settings"
          className={`settings-link-btn ${location.pathname === '/settings' ? 'is-active' : ''}`}
          aria-label={t('settings.title')}
        >
          <Settings size={15} />
        </Link>
      </Tooltip>

      <Tooltip content={user ? `${user.role === 'admin' ? '👑 Admin: ' : '👤 '}${user.email}` : t('topbar.authTitle')}>
        <Link
          to={user?.role === 'admin' ? '/admin' : '/auth'}
          className={`settings-link-btn ${location.pathname === '/auth' || location.pathname === '/admin' ? 'is-active' : ''}`}
          aria-label="Account"
        >
          {user?.role === 'admin' ? <Crown size={15} color="var(--accent)" /> : <User size={15} />}
        </Link>
      </Tooltip>
    </div>
  )
}

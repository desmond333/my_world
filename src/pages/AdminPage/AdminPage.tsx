import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Crown, Database, Eye, Lock, RefreshCw, Search, Shield, Trash2, User, Users, X } from 'lucide-react'
import { AppTopbar } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import { apiFetch } from '../../services/api/apiClient'
import { ViewModeToggle } from '../../shared/ui/ViewModeToggle/ViewModeToggle'
import { useAuthStore, usePageViewMode } from '../../store'
import type { SyncSnapshot } from '../../store/types'
import './AdminPage.css'

type AdminUser = {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  premium?: boolean
}

export const AdminPage = () => {
  const { t } = useTranslation()

  const currentUser = useAuthStore((state) => state.user)
  const { isSimple, toggleMode } = usePageViewMode('admin')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')

  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null)
  const [userSnapshot, setUserSnapshot] = useState<SyncSnapshot | null>(null)
  const [inspectLoading, setInspectLoading] = useState(false)

  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users')
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return
    const controller = new AbortController()
    void apiFetch<AdminUser[]>('/admin/users', { signal: controller.signal })
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch users')
        }
      })
    return () => controller.abort()
  }, [currentUser])

  const handleInspect = async (user: AdminUser) => {
    setInspectingUser(user)
    setUserSnapshot(null)
    setInspectLoading(true)
    try {
      const snapshot = await apiFetch<SyncSnapshot>(`/admin/users/${user.id}/sync`)
      setUserSnapshot(snapshot)
    } catch {
      setUserSnapshot(null)
    } finally {
      setInspectLoading(false)
    }
  }

  const togglePremium = async (target: AdminUser) => {
    try {
      await apiFetch(`/admin/users/${target.id}/premium`, {
        method: 'POST',
        body: JSON.stringify({ premium: !target.premium }),
      })
      await fetchUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update premium')
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    try {
      await apiFetch(`/admin/users/${deletingUser.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
      setDeletingUser(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !q || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'admin').length
    const regulars = total - admins
    return { total, admins, regulars }
  }, [users])

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <main className="page-shell">
        <AppTopbar />
        <div className="admin-access-denied">
          <div className="admin-access-icon">
            <Lock size={30} />
          </div>
          <h2>{t('admin.access.title')}</h2>
          <p>{t('admin.access.desc')}</p>
          <Link to="/auth" className="admin-link-btn" style={{ textDecoration: 'none' }}>
            <Shield size={16} />
            <span>{t('admin.access.goAuth')}</span>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-title-area">
            <div className="admin-title-badge">
              <Crown size={14} />
              <span>{t('admin.header.role')}</span>
            </div>
            <h1>{t('admin.header.title')}</h1>
            <p className="admin-subtitle">{t('admin.header.desc')}</p>
          </div>

          <div className="admin-header-actions">
            <ViewModeToggle mode={isSimple ? 'simple' : 'normal'} onChange={toggleMode} />

            <button type="button" className="admin-refresh-btn" onClick={() => void fetchUsers()} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
              <span>{t('admin.refresh')}</span>
            </button>
          </div>
        </div>

        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Users size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.total}</span>
              <span className="admin-metric-label">{t('admin.metric.total')}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Crown size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.admins}</span>
              <span className="admin-metric-label">{t('admin.metric.admins')}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <User size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value">{stats.regulars}</span>
              <span className="admin-metric-label">{t('admin.metric.users')}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <Database size={22} />
            </div>
            <div className="admin-metric-data">
              <span className="admin-metric-value" style={{ fontSize: 16, color: '#10b981' }}>
                ONLINE
              </span>
              <span className="admin-metric-label">{t('admin.metric.db')}</span>
            </div>
          </div>
        </div>

        <div className="admin-users-panel">
          <div className="admin-filter-bar">
            <div className="admin-search-wrapper">
              <Search size={15} className="admin-search-icon" />
              <input
                type="text"
                placeholder={t('admin.search.placeholder')}
                className="admin-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-role-filter">
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                {t('admin.filter.all')} ({users.length})
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                {t('admin.filter.admins')} ({stats.admins})
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${roleFilter === 'user' ? 'active' : ''}`}
                onClick={() => setRoleFilter('user')}
              >
                {t('admin.filter.users')} ({stats.regulars})
              </button>
            </div>
          </div>

          {error && <div className="auth-error-box">{error}</div>}

          {isSimple ? (
            <div className="admin-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>{t('admin.table.user')}</th>
                    <th>{t('admin.table.role')}</th>
                    <th>{t('admin.table.registered')}</th>
                    <th style={{ textAlign: 'right' }}>{t('admin.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                        {t('admin.empty')}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">{u.email.slice(0, 1).toUpperCase()}</div>
                            <div>
                              <div>{u.email}</div>
                              <span className="admin-user-id-code">{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${u.role}`}>
                            {u.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="admin-inspect-btn"
                              onClick={() => void handleInspect(u)}
                              title={t('admin.inspect.title')}
                            >
                              <Eye size={14} />
                              <span>{t('admin.inspect.data')}</span>
                            </button>

                            <button
                              type="button"
                              className={`admin-premium-btn${u.premium ? ' is-on' : ''}`}
                              onClick={() => void togglePremium(u)}
                              title={u.premium ? t('admin.premium.revoke') : t('admin.premium.grant')}
                              aria-pressed={Boolean(u.premium)}
                            >
                              <Crown size={14} />
                            </button>

                            {u.id !== currentUser.id && (
                              <button
                                type="button"
                                className="admin-delete-btn"
                                onClick={() => setDeletingUser(u)}
                                title={t('admin.delete.title')}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-normal-grid">
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', gridColumn: '1 / -1' }}>{t('admin.empty')}</div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="admin-user-card">
                    <div className="admin-user-card-head">
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">{u.email.slice(0, 1).toUpperCase()}</div>
                        <div>
                          <strong>{u.email}</strong>
                          <div className="admin-user-id-code">{u.id}</div>
                        </div>
                      </div>
                      <span className={`role-pill ${u.role}`}>
                        {u.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {u.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="admin-user-card-meta">
                      <span>
                        {t('admin.created')} {new Date(u.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="admin-action-btn-group">
                      <button
                        type="button"
                        className="admin-inspect-btn"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => void handleInspect(u)}
                      >
                        <Eye size={14} />
                        <span>{t('admin.inspect.full')}</span>
                      </button>

                      <button
                        type="button"
                        className={`admin-premium-btn${u.premium ? ' is-on' : ''}`}
                        onClick={() => void togglePremium(u)}
                        title={u.premium ? t('admin.premium.revoke') : t('admin.premium.grant')}
                        aria-pressed={Boolean(u.premium)}
                      >
                        <Crown size={14} />
                        <span>{u.premium ? t('admin.premium.active') : t('admin.premium.grant')}</span>
                      </button>

                      {u.id !== currentUser.id && (
                        <button type="button" className="admin-delete-btn" onClick={() => setDeletingUser(u)}>
                          <Trash2 size={14} />
                          <span>{t('admin.delete')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {inspectingUser && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>
                {t('admin.snapshot.title')} {inspectingUser.email}
              </h3>
              <button type="button" className="admin-modal-close" onClick={() => setInspectingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {inspectLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 10px' }} />
                  <div>{t('admin.snapshot.loading')}</div>
                </div>
              ) : userSnapshot ? (
                <>
                  <div className="snapshot-stats-grid">
                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.productivity?.items?.length || 0}</div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.tasks')}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.notes?.length || 0}</div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.notes')}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.finance?.entries?.length || 0}</div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.finance')}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">
                        {(userSnapshot.collection?.movies?.wishlist?.length || 0) +
                          (userSnapshot.collection?.movies?.watched?.length || 0) +
                          (userSnapshot.collection?.books?.wishlist?.length || 0) +
                          (userSnapshot.collection?.games?.wishlist?.length || 0)}
                      </div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.media')}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.shop?.coins ?? 1000} 🪙</div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.shop')}</div>
                    </div>

                    <div className="snapshot-stat-box">
                      <div className="snapshot-stat-number">{userSnapshot.favorites?.length || 0}</div>
                      <div className="snapshot-stat-title">{t('admin.snapshot.favorites')}</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--fg)' }}>{t('admin.snapshot.raw')}</h4>
                    <pre className="snapshot-json-preview">{JSON.stringify(userSnapshot, null, 2)}</pre>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>{t('admin.snapshot.failed')}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal-head">
              <h3>{t('admin.deleteConfirm.title')}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeletingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ color: '#ef4444' }}>
                  <AlertTriangle size={32} />
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                  {t('admin.deleteConfirm.desc', undefined, { email: deletingUser.email })}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="admin-refresh-btn" onClick={() => setDeletingUser(null)} disabled={deleteLoading}>
                  {t('common.cancel')}
                </button>
                <button type="button" className="admin-delete-btn" onClick={() => void handleDelete()} disabled={deleteLoading}>
                  <Trash2 size={14} />
                  <span>{deleteLoading ? t('admin.deleting') : t('admin.deleteForever')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

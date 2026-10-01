import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  Cloud,
  Crown,
  Database,
  Download,
  Eye,
  Feather,
  HardDrive,
  Lock,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import { AppTopbar } from '../../widgets'
import { cities, defaultBlocks, type ThemePaletteId } from '../../data'
import { extraSections } from '../ExtraPage/sections'
import {
  APP_BUILT_AT,
  APP_COMMIT,
  APP_VERSION,
  clearTemporaryCache,
  downloadBackupFile,
  getStorageStats,
  resetAllData,
  restoreBackupFromJSON,
  THEME_PALETTES,
  VIP_THEMES,
  type StorageStats,
} from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { Card, Switch, ViewModeToggle } from '../../shared/ui'
import {
  VIEW_PAGES,
  type ViewMode,
  type ViewPageId,
  useAuthStore,
  useDailyStore,
  useFriendsStore,
  usePageViewMode,
  useShopStore,
  useViewModeStore,
} from '../../store'
import './SettingsPage.css'

export const SettingsPage = () => {
  const { lang, setLang, t } = useTranslation()
  const { isSimple } = usePageViewMode('settings' as ViewPageId)
  const globalMode = useViewModeStore((state) => state.globalMode)
  const pageModes = useViewModeStore((state) => state.pageModes)
  const avatarMode = useViewModeStore((state) => state.avatarMode ?? 'simple')
  const setPageMode = useViewModeStore((state) => state.setPageMode)
  const setAvatarMode = useViewModeStore((state) => state.setAvatarMode)
  const setAllModes = useViewModeStore((state) => state.setAllModes)

  const themeMode = useDailyStore((state) => state.themeMode ?? 'system')
  const setThemeMode = useDailyStore((state) => state.setThemeMode)
  const themePalette = useDailyStore((state) => state.themePalette ?? 'auto')
  const setThemePalette = useDailyStore((state) => state.setThemePalette)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const equipThemeSkin = useShopStore((state) => state.equipThemeSkin)
  const isShopUnlocked = useShopStore((state) => state.isUnlocked)
  const cityId = useDailyStore((state) => state.cityId)
  const setCity = useDailyStore((state) => state.setCity)
  const blocks = useDailyStore((state) => state.blocks ?? defaultBlocks)
  const toggleBlock = useDailyStore((state) => state.toggleBlock)
  const allowFriendTasks = useDailyStore((state) => state.allowFriendTasks ?? true)
  const setAllowFriendTasks = useDailyStore((state) => state.setAllowFriendTasks)
  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])
  const toggleSection = useDailyStore((state) => state.toggleSection)
  const resetHiddenSections = useDailyStore((state) => state.resetHiddenSections)
  const user = useAuthStore((state) => state.user)
  const openFriendsModal = useFriendsStore((state) => state.openModal)
  const friendsCount = useFriendsStore((state) => state.friends.length)

  const [stats, setStats] = useState<StorageStats | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEn = lang === 'en'

  const refreshStats = () => {
    void getStorageStats().then(setStats)
  }

  useEffect(() => {
    let cancelled = false
    void getStorageStats().then((next) => {
      if (!cancelled) setStats(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const allAreSimple = useMemo(() => VIEW_PAGES.every((p) => (pageModes[p.id] ?? globalMode) === 'simple'), [pageModes, globalMode])
  const allAreNormal = useMemo(() => VIEW_PAGES.every((p) => (pageModes[p.id] ?? globalMode) === 'normal'), [pageModes, globalMode])

  const handleExport = () => {
    downloadBackupFile()
    setFeedback({
      type: 'success',
      message: t('settings.backup-file-downloaded-successfully', 'Файл резервной копии успешно скачан!'),
    })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (!content) return
      const res = restoreBackupFromJSON(content)
      if (res.success) {
        refreshStats()
        setFeedback({
          type: 'success',
          message: t('settings.data.importSuccess', undefined, { count: res.count }),
        })
        setTimeout(() => {
          setFeedback(null)
          window.location.reload()
        }, 1500)
      } else {
        setFeedback({
          type: 'error',
          message: t('settings.data.importFailed'),
        })
        setTimeout(() => setFeedback(null), 4000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearCache = () => {
    const res = clearTemporaryCache()
    refreshStats()
    setFeedback({
      type: 'success',
      message: `${t('settings.data.cacheCleared')} (${res.clearedKeys} ${t('settings.items')})`,
    })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleFullReset = async () => {
    await resetAllData()
    setShowResetConfirm(false)
    window.location.reload()
  }

  const selectThemePalette = (palette: ThemePaletteId) => {
    setThemePalette(palette)
    if (activeThemeSkin && activeThemeSkin !== 'default') equipThemeSkin('default')
  }

  const selectThemeVariant = (palette: ThemePaletteId, mode: 'light' | 'dark') => {
    setThemePalette(palette)
    setThemeMode(mode)
    if (activeThemeSkin && activeThemeSkin !== 'default') equipThemeSkin('default')
  }

  const isLightVariant = (palette: ThemePaletteId) => themePalette === palette && themeMode === 'light'
  const isDarkVariant = (palette: ThemePaletteId) => themePalette === palette && themeMode === 'dark'

  const isVipUnlocked = (shopKey: string) => isShopUnlocked(shopKey as Parameters<typeof isShopUnlocked>[0])

  const selectVipTheme = (skin: string, mode?: 'light' | 'dark') => {
    if (!isVipUnlocked(`theme_${skin}`)) return
    equipThemeSkin(skin as Parameters<typeof equipThemeSkin>[0])
    if (mode) setThemeMode(mode)
  }

  return (
    <div className="page-shell">
      <AppTopbar />

      <main className="settings-page">
        <header className="settings-head">
          <p className="eyebrow">
            <SettingsIcon size={14} /> {t('settings.kicker')}
          </p>
          <h1>{t('settings.title')}</h1>
          <p className="intro">{t('settings.intro')}</p>
        </header>

        <section className="settings-section">
          <div className="settings-section-head">
            <div className="settings-section-title">
              <Sliders size={18} className="settings-section-icon" />
              <h2>{t('settings.viewMode.masterTitle')}</h2>
            </div>
            <p className="settings-section-desc">{t('settings.viewMode.masterDesc')}</p>
          </div>

          <div className="master-switch-grid">
            <button type="button" className={`master-mode-card ${allAreSimple ? 'is-selected' : ''}`} onClick={() => setAllModes('simple')}>
              <div className="master-mode-header">
                <span className="master-mode-icon">
                  <Feather size={20} />
                </span>
                <span className="master-mode-badge">{t('settings.viewMode.defaultBadge')}</span>
              </div>
              <strong className="master-mode-name">{t('settings.viewMode.applyAllSimple')}</strong>
              <p className="master-mode-text">{t('settings.viewMode.simpleDesc')}</p>
              <div className="master-mode-status">
                {allAreSimple && (
                  <span className="master-mode-active">
                    <Check size={14} /> {t('common.today') === 'Сегодня' ? 'Активен везде' : 'Active everywhere'}
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              className={`master-mode-card is-normal-card ${allAreNormal ? 'is-selected' : ''}`}
              onClick={() => setAllModes('normal')}
            >
              <div className="master-mode-header">
                <span className="master-mode-icon">
                  <Sparkles size={20} />
                </span>
              </div>
              <strong className="master-mode-name">{t('settings.viewMode.applyAllNormal')}</strong>
              <p className="master-mode-text">{t('settings.viewMode.normalDesc')}</p>
              <div className="master-mode-status">
                {allAreNormal && (
                  <span className="master-mode-active">
                    <Check size={14} /> {t('common.today') === 'Сегодня' ? 'Активен везде' : 'Active everywhere'}
                  </span>
                )}
              </div>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h2>{t('settings.viewMode.pagesTitle')}</h2>
            <p className="settings-section-desc">{t('settings.viewMode.pagesDesc')}</p>
          </div>

          <div className="page-modes-list">
            {VIEW_PAGES.map((page) => {
              const currentMode: ViewMode = pageModes[page.id] ?? globalMode ?? 'simple'

              return (
                <div key={page.id} className="page-mode-row">
                  <div className="page-mode-info">
                    <span className="page-mode-name">{t(page.titleKey)}</span>
                    <span className="page-mode-hint">
                      {currentMode === 'simple' ? t('settings.viewMode.simpleDesc') : t('settings.viewMode.normalDesc')}
                    </span>
                  </div>

                  <div className="page-mode-control">
                    <ViewModeToggle
                      mode={currentMode}
                      onChange={(next) => setPageMode(page.id as ViewPageId, next)}
                      size="sm"
                      variant="segmented"
                      ariaLabel={t('settings.viewMode.toggleAria', undefined, {
                        title: t(page.titleKey),
                      })}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h2>{t('settings.avatar.title')}</h2>
            <p className="settings-section-desc">{t('settings.avatar.desc')}</p>
          </div>

          <div className="page-modes-list">
            <div className="page-mode-row">
              <div className="page-mode-info">
                <span className="page-mode-name">{avatarMode === 'simple' ? t('cat.mode.simple') : t('cat.mode.normal')}</span>
                <span className="page-mode-hint">
                  {avatarMode === 'simple' ? t('settings.avatar.simpleDesc') : t('settings.avatar.normalDesc')}
                </span>
              </div>

              <div className="page-mode-control">
                <ViewModeToggle mode={avatarMode} onChange={setAvatarMode} size="sm" variant="segmented" />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <div className="settings-section-title">
              <Eye size={18} className="settings-section-icon" />
              <h2>{t('settings.sectionsVisibility.title')}</h2>
            </div>
            <p className="settings-section-desc">{t('settings.sectionsVisibility.desc')}</p>
          </div>

          <div className="page-modes-list">
            {extraSections.map((section) => {
              const isVisible = !hiddenSections.includes(section.key)

              return (
                <div key={section.key} className="page-mode-row">
                  <div className="page-mode-info">
                    <span className="page-mode-name">{t(`section.${section.key}`, section.label)}</span>
                    <span className="page-mode-hint">{t(`section.${section.key}.hint`, section.hint)}</span>
                  </div>

                  <div className="page-mode-control">
                    <Switch checked={isVisible} onCheckedChange={() => toggleSection(section.key)} standalone />
                  </div>
                </div>
              )
            })}
          </div>

          {hiddenSections.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <button type="button" className="add-button" onClick={resetHiddenSections}>
                <Sparkles size={14} />
                <span>{t('settings.sectionsVisibility.showAll')}</span>
              </button>
            </div>
          )}
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <div className="settings-section-title">
              <Users size={18} className="settings-section-icon" />
              <h2>{t('friends.settings.title')}</h2>
            </div>
            <p className="settings-section-desc">{t('friends.settings.allowTasksDesc')}</p>
          </div>

          <div className="page-modes-list">
            <div className="page-mode-row">
              <div className="page-mode-info">
                <span className="page-mode-name">{t('friends.settings.allowTasks')}</span>
                <span className="page-mode-hint">{t('friends.settings.allowTasksDesc')}</span>
              </div>
              <div className="page-mode-control">
                <Switch checked={allowFriendTasks} onCheckedChange={setAllowFriendTasks} standalone />
              </div>
            </div>

            <div className="page-mode-row" style={{ marginTop: '8px' }}>
              <div className="page-mode-info">
                <span className="page-mode-name">{t('friends.settings.friendsCount', undefined, { count: friendsCount })}</span>
                <span className="page-mode-hint">{user ? t('friends.title') : t('friends.loginPrompt')}</span>
              </div>
              <div className="page-mode-control">
                <button
                  type="button"
                  className="add-button"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  onClick={() => openFriendsModal()}
                >
                  <Users size={14} />
                  <span>{t('friends.settings.manageBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <div className="settings-section-title">
              <Database size={18} className="settings-section-icon" />
              <h2>{t('settings.data.title')}</h2>
            </div>
            <p className="settings-section-desc">{t('settings.data.desc')}</p>
          </div>

          {feedback && (
            <div className={`settings-feedback-banner is-${feedback.type}`} role="status" aria-live="polite">
              {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="storage-overview-card">
            <div className="storage-overview-metric">
              <div className="storage-metric-head">
                <HardDrive size={18} className="storage-metric-icon" />
                <span className="storage-metric-label">{t('settings.data.storageUsed')}</span>
              </div>
              <div className="storage-metric-val">
                <strong>{stats?.formattedSize ?? '—'}</strong>
                <span className="storage-metric-count">{stats ? `(${stats.itemsCount} ${t('settings.entries')})` : ''}</span>
              </div>
            </div>

            {!isSimple && (stats?.categories.length ?? 0) > 0 && (
              <div className="storage-categories-breakdown">
                {(stats?.categories ?? [])
                  .filter((c) => c.bytes > 0)
                  .map((c) => (
                    <div key={c.id} className="storage-category-pill">
                      <span className="cat-pill-name">{isEn ? c.nameEn : c.nameRu}</span>
                      <strong className="cat-pill-size">{c.sizeFormatted}</strong>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="settings-data-actions-grid">
            <div className="settings-data-card">
              <div className="data-card-info">
                <strong>{t('settings.cloud-sync-account', 'Облако и синхронизация')}</strong>
                <p>
                  {user
                    ? t('settings.signedInAs', undefined, {
                        email: user.email,
                        role: user.role === 'admin' ? t('common.roleAdmin') : t('common.roleUser'),
                      })
                    : t(
                        'settings.offline-mode-connect-to-cloudflare-d1-to-backup-',
                        'Офлайн-режим. Подключись к Cloudflare D1 для бэкапа и синхронизации.',
                      )}
                </p>
              </div>
              <div className="data-card-btns">
                <Link to="/auth" className="settings-action-btn is-primary" style={{ textDecoration: 'none' }}>
                  <Cloud size={14} />
                  <span>
                    {user
                      ? t('settings.manage-account', 'Управление аккаунтом')
                      : t('settings.sign-in-register', 'Войти / Создать аккаунт')}
                  </span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="settings-action-btn is-outline" style={{ textDecoration: 'none' }}>
                    <Crown size={14} />
                    <span>{t('settings.admin-panel', 'Админ-панель')}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="settings-data-card">
              <div className="data-card-info">
                <strong>{t('settings.data.backupTitle')}</strong>
                <p>{t('settings.data.backupDesc')}</p>
              </div>
              <div className="data-card-btns">
                <button type="button" className="settings-action-btn is-primary" onClick={handleExport}>
                  <Download size={14} />
                  <span>{t('settings.data.exportBtn')}</span>
                </button>

                <button type="button" className="settings-action-btn is-outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} />
                  <span>{t('settings.data.importBtn')}</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="visually-hidden" />
              </div>
            </div>

            <div className="settings-data-card">
              <div className="data-card-info">
                <strong>{t('settings.data.cacheTitle')}</strong>
                <p>{t('settings.data.cacheDesc')}</p>
              </div>
              <div className="data-card-btns">
                <button type="button" className="settings-action-btn is-outline" onClick={handleClearCache}>
                  <RefreshCw size={14} />
                  <span>{t('settings.data.clearCacheBtn')}</span>
                </button>
              </div>
            </div>

            <div className="settings-data-card is-danger-card">
              <div className="data-card-info">
                <strong className="text-danger">{t('settings.data.resetTitle')}</strong>
                <p>{t('settings.data.resetDesc')}</p>
              </div>

              <div className="data-card-btns">
                {!showResetConfirm ? (
                  <button type="button" className="settings-action-btn is-danger" onClick={() => setShowResetConfirm(true)}>
                    <Trash2 size={14} />
                    <span>{t('settings.data.resetBtn')}</span>
                  </button>
                ) : (
                  <div className="reset-confirm-box">
                    <p className="reset-confirm-msg">{t('settings.data.resetConfirmText')}</p>
                    <div className="reset-confirm-actions">
                      <button type="button" className="settings-action-btn is-danger-solid" onClick={handleFullReset}>
                        <Trash2 size={14} />
                        <span>{t('settings.data.resetConfirmBtn')}</span>
                      </button>
                      <button type="button" className="settings-action-btn is-outline" onClick={() => setShowResetConfirm(false)}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h2>{t('settings.general.title')}</h2>
          </div>

          <div className="settings-grid">
            <Card className="settings-pref-card">
              <span className="settings-pref-label">{t('settings.general.lang')}</span>
              <div className="settings-pill-group">
                <button type="button" className={`settings-pill-btn ${lang === 'ru' ? 'is-active' : ''}`} onClick={() => setLang('ru')}>
                  Русский (RU)
                </button>
                <button type="button" className={`settings-pill-btn ${lang === 'en' ? 'is-active' : ''}`} onClick={() => setLang('en')}>
                  English (EN)
                </button>
              </div>
            </Card>

            <Card className="settings-pref-card">
              <span className="settings-pref-label">{t('settings.general.city')}</span>
              <select
                className="settings-select"
                value={cityId}
                onChange={(e) => {
                  const found = cities.find((c) => c.id === e.target.value)
                  if (found) setCity(found)
                }}
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.zone})
                  </option>
                ))}
              </select>
            </Card>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <div className="settings-section-title">
              <Palette size={18} className="settings-section-icon" />
              <h2>{t('settings.theme.title')}</h2>
            </div>
            <p className="settings-section-desc">{t('settings.theme.desc')}</p>
          </div>

          <div className="theme-mode-row">
            <span className="settings-pref-label">{t('settings.theme.mode')}</span>
            <div className="settings-pill-group">
              <button
                type="button"
                className={`settings-pill-btn ${themeMode === 'system' ? 'is-active' : ''}`}
                onClick={() => setThemeMode('system')}
              >
                <Monitor size={14} /> {t('theme.system')}
              </button>
              <button
                type="button"
                className={`settings-pill-btn ${themeMode === 'light' ? 'is-active' : ''}`}
                onClick={() => selectThemeVariant(themePalette, 'light')}
              >
                <Sun size={14} /> {t('theme.light')}
              </button>
              <button
                type="button"
                className={`settings-pill-btn ${themeMode === 'dark' ? 'is-active' : ''}`}
                onClick={() => selectThemeVariant(themePalette, 'dark')}
              >
                <Moon size={14} /> {t('theme.dark')}
              </button>
            </div>
          </div>

          <div className="theme-cards-grid">
            {THEME_PALETTES.map((palette) => {
              const isActive = themePalette === palette.id

              return (
                <div key={palette.id} className={`theme-card ${isActive ? 'is-active' : ''}`}>
                  <button type="button" className="theme-card-main" onClick={() => selectThemePalette(palette.id)} aria-pressed={isActive}>
                    <span className="theme-card-preview" aria-hidden="true">
                      <span className="theme-card-preview-half" style={{ background: palette.preview.light.bg }}>
                        <span className="theme-card-preview-dot" style={{ background: palette.preview.light.accent }} />
                      </span>
                      <span className="theme-card-preview-half" style={{ background: palette.preview.dark.bg }}>
                        <span className="theme-card-preview-dot" style={{ background: palette.preview.dark.accent }} />
                      </span>
                    </span>

                    <span className="theme-card-info">
                      <strong>{t(palette.nameKey, palette.fallback)}</strong>
                      {palette.hintKey && <small>{t(palette.hintKey, palette.hintFallback)}</small>}
                    </span>

                    {isActive && <Check size={16} className="theme-card-check" />}
                  </button>

                  <div className="theme-card-variants">
                    <button
                      type="button"
                      className={`theme-variant-btn ${isLightVariant(palette.id) ? 'is-on' : ''}`}
                      onClick={() => selectThemeVariant(palette.id, 'light')}
                    >
                      <Sun size={14} /> {t('theme.light')}
                    </button>
                    <button
                      type="button"
                      className={`theme-variant-btn ${isDarkVariant(palette.id) ? 'is-on' : ''}`}
                      onClick={() => selectThemeVariant(palette.id, 'dark')}
                    >
                      <Moon size={14} /> {t('theme.dark')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {activeThemeSkin && activeThemeSkin !== 'default' && (
            <p className="settings-section-desc theme-vip-note">{t('settings.theme.vipNote')}</p>
          )}

          <div className="theme-vip-head">
            <Crown size={15} />
            <span>{t('settings.theme.vip')}</span>
          </div>

          <div className="theme-cards-grid">
            {VIP_THEMES.map((vip) => {
              const unlocked = isVipUnlocked(vip.shopKey)
              const isActive = activeThemeSkin === vip.skin

              return (
                <div key={vip.skin} className={`theme-card theme-card--vip ${isActive ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}`}>
                  <button
                    type="button"
                    className="theme-card-main"
                    onClick={() => selectVipTheme(vip.skin)}
                    aria-pressed={isActive}
                    disabled={!unlocked}
                  >
                    <span className="theme-card-preview" aria-hidden="true">
                      <span className="theme-card-preview-half" style={{ background: vip.preview.light.bg }}>
                        <span className="theme-card-preview-dot" style={{ background: vip.preview.light.accent }} />
                      </span>
                      <span className="theme-card-preview-half" style={{ background: vip.preview.dark.bg }}>
                        <span className="theme-card-preview-dot" style={{ background: vip.preview.dark.accent }} />
                      </span>
                    </span>

                    <span className="theme-card-info">
                      <strong>{t(vip.nameKey, vip.fallback)}</strong>
                      {!unlocked && <small>{t('settings.theme.price', undefined, { price: vip.price })}</small>}
                    </span>

                    {isActive ? (
                      <Check size={16} className="theme-card-check" />
                    ) : !unlocked ? (
                      <Lock size={15} className="theme-card-lock" />
                    ) : null}
                  </button>

                  {unlocked ? (
                    <div className="theme-card-variants">
                      <button
                        type="button"
                        className={`theme-variant-btn ${isActive && themeMode === 'light' ? 'is-on' : ''}`}
                        onClick={() => selectVipTheme(vip.skin, 'light')}
                      >
                        <Sun size={14} /> {t('theme.light')}
                      </button>
                      <button
                        type="button"
                        className={`theme-variant-btn ${isActive && themeMode === 'dark' ? 'is-on' : ''}`}
                        onClick={() => selectVipTheme(vip.skin, 'dark')}
                      >
                        <Moon size={14} /> {t('theme.dark')}
                      </button>
                    </div>
                  ) : (
                    <Link to="/shop" className="theme-vip-unlock">
                      <Lock size={13} /> {t('settings.theme.locked')}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h2>{t('settings.blocks.title')}</h2>
            <p className="settings-section-desc">{t('settings.blocks.desc')}</p>
          </div>

          <div className="blocks-toggle-grid">
            {(Object.keys(defaultBlocks) as (keyof typeof defaultBlocks)[]).map((key) => {
              const isOn = blocks[key] ?? true

              return (
                <button
                  key={key}
                  type="button"
                  className={`block-chip ${isOn ? 'is-on' : 'is-off'}`}
                  onClick={() => toggleBlock(key)}
                  aria-pressed={isOn}
                >
                  <span className="block-chip-mark">{isOn ? <Check size={13} /> : '✕'}</span>
                  <span className="block-chip-label">{key}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h2>{t('settings.about.title')}</h2>
          </div>
          <div className="settings-grid">
            <Card className="settings-pref-card">
              <span className="settings-pref-label">{t('settings.about.version')}</span>
              <span className="settings-about-value">
                TAU v{APP_VERSION} · {APP_COMMIT}
                {APP_BUILT_AT ? ` · ${APP_BUILT_AT}` : ''}
              </span>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

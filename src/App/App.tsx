import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from '../lib/i18n'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { findCity } from '../data'
import { MINUTE_MS, useNow } from '../hooks'
import { getSeason } from '../lib'
import { useAnimalsStore, useDailyStore, useShopStore } from '../store'
import { DailyPage } from '../pages/DailyPage/DailyPage'
import { NewUserHint } from '../components/NewUserHint/NewUserHint'
import { CatAssistant } from '../components/CatAssistant/CatAssistant'

const AnimalPage = lazy(() => import('../pages/AnimalPage/AnimalPage').then((m) => ({ default: m.AnimalPage })))
const ExtraPage = lazy(() => import('../pages/ExtraPage/ExtraPage').then((m) => ({ default: m.ExtraPage })))
const MiscPage = lazy(() => import('../pages/MiscPage/MiscPage').then((m) => ({ default: m.MiscPage })))
const CreatorPage = lazy(() => import('../pages/CreatorPage/CreatorPage').then((m) => ({ default: m.CreatorPage })))
const FavoritesPage = lazy(() => import('../pages/FavoritesPage/FavoritesPage').then((m) => ({ default: m.FavoritesPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const ShopPage = lazy(() => import('../pages/ShopPage/ShopPage').then((m) => ({ default: m.ShopPage })))

const TrainingPage = lazy(() => import('../pages/TrainingPage/TrainingPage').then((m) => ({ default: m.TrainingPage })))
const FinancePage = lazy(() => import('../pages/ExtraPage/Finance/FinancePage').then((m) => ({ default: m.FinancePage })))
const ProductivityPage = lazy(() =>
  import('../pages/ExtraPage/Productivity/ProductivityPage').then((m) => ({ default: m.ProductivityPage })),
)
const TasksPage = lazy(() => import('../pages/ExtraPage/Productivity/Tasks/TasksPage').then((m) => ({ default: m.TasksPage })))
const GoalsPage = lazy(() => import('../pages/ExtraPage/Productivity/Goals/GoalsPage').then((m) => ({ default: m.GoalsPage })))
const DreamsPage = lazy(() => import('../pages/ExtraPage/Productivity/Dreams/DreamsPage').then((m) => ({ default: m.DreamsPage })))
const StatusPage = lazy(() => import('../pages/ExtraPage/Productivity/Status/StatusPage').then((m) => ({ default: m.StatusPage })))
const MoodPage = lazy(() => import('../pages/ExtraPage/Productivity/Mood/MoodPage').then((m) => ({ default: m.MoodPage })))
const NotesPage = lazy(() => import('../pages/NotesPage/NotesPage').then((m) => ({ default: m.NotesPage })))
const MediaPage = lazy(() => import('../pages/ExtraPage/Media/MediaPage').then((m) => ({ default: m.MediaPage })))
const MoviesPage = lazy(() => import('../pages/ExtraPage/Media/Movies/MoviesPage').then((m) => ({ default: m.MoviesPage })))
const BooksPage = lazy(() => import('../pages/ExtraPage/Media/Books/BooksPage').then((m) => ({ default: m.BooksPage })))
const GamesPage = lazy(() => import('../pages/ExtraPage/Media/Games/GamesPage').then((m) => ({ default: m.GamesPage })))

const SubscriptionsPage = lazy(() =>
  import('../pages/MiscPage/Subscriptions/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })),
)
const LanguagesPage = lazy(() => import('../pages/MiscPage/Languages/LanguagesPage').then((m) => ({ default: m.LanguagesPage })))
const FunPage = lazy(() => import('../pages/MiscPage/Fun/FunPage').then((m) => ({ default: m.FunPage })))
const LotteryPage = lazy(() => import('../pages/MiscPage/Lottery/LotteryPage').then((m) => ({ default: m.LotteryPage })))

const ThemeSync = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const themeMode = useDailyStore((state) => state.themeMode)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const now = useNow(MINUTE_MS)
  const season = getSeason(now, findCity(cityId).timezone)

  useEffect(() => {
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    }

    const applyTheme = () => {
      const mode = themeMode ?? 'system'
      const effective = mode === 'system' ? getSystemTheme() : mode
      document.documentElement.dataset.theme = `${season}-${effective}`

      if (activeThemeSkin && activeThemeSkin !== 'default') {
        document.documentElement.dataset.themeOverride = activeThemeSkin
      } else {
        delete document.documentElement.dataset.themeOverride
      }
    }

    applyTheme()

    if ((themeMode ?? 'system') === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: light)')
      const listener = () => applyTheme()
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [season, themeMode, activeThemeSkin])

  return null
}

const PageLoader = () => {
  const { t } = useTranslation()

  return (
    <main className="page-shell">
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh', color: 'var(--muted)' }}>
        <p style={{ font: "500 14px 'DM Mono', monospace" }}>{t('common.loading')}</p>
      </div>
    </main>
  )
}

const NotFound = () => {
  const { t } = useTranslation()
  const title = t('notFound.title')
  const desc = t('notFound.note')
  const homeBtn = t('common.home')

  return (
    <main className="page-shell">
      <section className="favorites-empty">
        <h2>{title}</h2>
        <p>{desc}</p>
        <Link className="add-button" to="/today">
          {homeBtn}
        </Link>
      </section>
    </main>
  )
}

const StartRedirect = () => {
  const startPage = useDailyStore((state) => state.startPage)
  const target = startPage && startPage !== '/' ? startPage : '/today'
  return <Navigate to={target} replace />
}

const AnimalsLoader = () => {
  const load = useAnimalsStore((state) => state.load)
  useEffect(() => {
    void load()
  }, [load])
  return null
}

const App = () => (
  <BrowserRouter>
    <ThemeSync />
    <AnimalsLoader />
    <NewUserHint />
    <CatAssistant />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<StartRedirect />} />
        <Route path="/today" element={<DailyPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/training" element={<Navigate to="/extra/training" replace />} />
        <Route path="/clowns" element={<Navigate to="/misc/fun" replace />} />
        <Route path="/fun" element={<Navigate to="/misc/fun" replace />} />
        <Route path="/subscriptions" element={<Navigate to="/misc/subscriptions" replace />} />
        <Route path="/languages" element={<Navigate to="/misc/languages" replace />} />
        <Route path="/georgian" element={<Navigate to="/misc/languages?tab=georgian" replace />} />
        <Route path="/english" element={<Navigate to="/misc/languages?tab=english" replace />} />
        <Route path="/lottery" element={<Navigate to="/misc/lottery" replace />} />
        <Route path="/creator" element={<CreatorPage />} />
        <Route path="/extra" element={<ExtraPage />}>
          <Route index element={<Navigate to="/extra/training" replace />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="subscriptions" element={<Navigate to="/misc/subscriptions" replace />} />
          <Route path="languages" element={<Navigate to="/misc/languages" replace />} />
          <Route path="georgian" element={<Navigate to="/misc/languages?tab=georgian" replace />} />
          <Route path="english" element={<Navigate to="/misc/languages?tab=english" replace />} />
          <Route path="lottery" element={<Navigate to="/misc/lottery" replace />} />
          <Route path="clowns" element={<Navigate to="/misc/fun" replace />} />
          <Route path="fun" element={<Navigate to="/misc/fun" replace />} />
          <Route path="productivity" element={<ProductivityPage />}>
            <Route index element={<Navigate to="/extra/productivity/task" replace />} />
            <Route path="task" element={<TasksPage />} />
            <Route path="goal" element={<GoalsPage />} />
            <Route path="dream" element={<DreamsPage />} />
            <Route path="mood" element={<MoodPage />} />
            <Route path="status" element={<StatusPage />} />
          </Route>
          <Route path="media" element={<MediaPage />}>
            <Route index element={<Navigate to="/extra/media/movies" replace />} />
            <Route path="movies" element={<MoviesPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="games" element={<GamesPage />} />
          </Route>
        </Route>
        <Route path="/misc" element={<MiscPage />}>
          <Route index element={<Navigate to="/misc/subscriptions" replace />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="languages" element={<LanguagesPage />} />
          <Route path="georgian" element={<Navigate to="/misc/languages?tab=georgian" replace />} />
          <Route path="english" element={<Navigate to="/misc/languages?tab=english" replace />} />
          <Route path="fun" element={<FunPage />} />
          <Route path="clowns" element={<FunPage />} />
          <Route path="lottery" element={<LotteryPage />} />
        </Route>
        <Route path="/animal/:id" element={<AnimalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App

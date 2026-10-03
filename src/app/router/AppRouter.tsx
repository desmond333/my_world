import { lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { useDailyStore } from '../../store'
import { PageTransition } from '../../shared/ui'
import { DailyPage } from '../../pages/DailyPage/DailyPage'

const AnimalPage = lazy(() => import('../../pages/AnimalPage/AnimalPage').then((m) => ({ default: m.AnimalPage })))
const UsefulPage = lazy(() => import('../../pages/UsefulPage/UsefulPage').then((m) => ({ default: m.UsefulPage })))
const CreatorPage = lazy(() => import('../../pages/CreatorPage/CreatorPage').then((m) => ({ default: m.CreatorPage })))
const FavoritesPage = lazy(() => import('../../pages/FavoritesPage/FavoritesPage').then((m) => ({ default: m.FavoritesPage })))
const SettingsPage = lazy(() => import('../../pages/SettingsPage/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const ShopPage = lazy(() => import('../../pages/ShopPage/ShopPage').then((m) => ({ default: m.ShopPage })))
const AuthPage = lazy(() => import('../../pages/AuthPage/AuthPage').then((m) => ({ default: m.AuthPage })))
const AdminPage = lazy(() => import('../../pages/AdminPage/AdminPage').then((m) => ({ default: m.AdminPage })))

const TrainingPage = lazy(() => import('../../pages/TrainingPage/TrainingPage').then((m) => ({ default: m.TrainingPage })))
const FinancePage = lazy(() => import('../../pages/UsefulPage/Finance/FinancePage').then((m) => ({ default: m.FinancePage })))
const FinanceOperationsTab = lazy(() =>
  import('../../pages/UsefulPage/Finance/tabs/FinanceOperationsTab').then((m) => ({ default: m.FinanceOperationsTab })),
)
const FinanceDepositsTab = lazy(() =>
  import('../../pages/UsefulPage/Finance/tabs/FinanceDepositsTab').then((m) => ({ default: m.FinanceDepositsTab })),
)
const FinanceLoansTab = lazy(() =>
  import('../../pages/UsefulPage/Finance/tabs/FinanceLoansTab').then((m) => ({ default: m.FinanceLoansTab })),
)
const FinanceSubscriptionsTab = lazy(() =>
  import('../../pages/UsefulPage/Finance/tabs/FinanceSubscriptionsTab').then((m) => ({ default: m.FinanceSubscriptionsTab })),
)
const FinanceAdviceTab = lazy(() =>
  import('../../pages/UsefulPage/Finance/tabs/FinanceAdviceTab').then((m) => ({ default: m.FinanceAdviceTab })),
)
const ProductivityPage = lazy(() =>
  import('../../pages/UsefulPage/Productivity/ProductivityPage').then((m) => ({ default: m.ProductivityPage })),
)
const TasksPage = lazy(() => import('../../pages/UsefulPage/Productivity/Tasks/TasksPage').then((m) => ({ default: m.TasksPage })))
const GoalsPage = lazy(() => import('../../pages/UsefulPage/Productivity/Goals/GoalsPage').then((m) => ({ default: m.GoalsPage })))
const DreamsPage = lazy(() => import('../../pages/UsefulPage/Productivity/Dreams/DreamsPage').then((m) => ({ default: m.DreamsPage })))
const StatusPage = lazy(() => import('../../pages/UsefulPage/Productivity/Status/StatusPage').then((m) => ({ default: m.StatusPage })))
const NotesTab = lazy(() => import('../../pages/UsefulPage/Productivity/Notes/NotesTab').then((m) => ({ default: m.NotesTab })))
const MindPage = lazy(() => import('../../pages/UsefulPage/Mind/MindPage').then((m) => ({ default: m.MindPage })))
const DreamsDiaryTab = lazy(() => import('../../pages/UsefulPage/Mind/Dreams/DreamsDiaryTab').then((m) => ({ default: m.DreamsDiaryTab })))
const MoodPage = lazy(() => import('../../pages/UsefulPage/Productivity/Mood/MoodPage').then((m) => ({ default: m.MoodPage })))
const RemindPage = lazy(() => import('../../pages/UsefulPage/Remind/RemindPage').then((m) => ({ default: m.RemindPage })))
const BirthdaysTab = lazy(() => import('../../pages/UsefulPage/Remind/Birthdays/BirthdaysTab').then((m) => ({ default: m.BirthdaysTab })))
const MediaPage = lazy(() => import('../../pages/UsefulPage/Media/MediaPage').then((m) => ({ default: m.MediaPage })))
const MoviesPage = lazy(() => import('../../pages/UsefulPage/Media/Movies/MoviesPage').then((m) => ({ default: m.MoviesPage })))
const BooksPage = lazy(() => import('../../pages/UsefulPage/Media/Books/BooksPage').then((m) => ({ default: m.BooksPage })))
const GamesPage = lazy(() => import('../../pages/UsefulPage/Media/Games/GamesPage').then((m) => ({ default: m.GamesPage })))

const LanguagesPage = lazy(() => import('../../pages/MorePage/Languages/LanguagesPage').then((m) => ({ default: m.LanguagesPage })))
const FunPage = lazy(() => import('../../pages/MorePage/Fun/FunPage').then((m) => ({ default: m.FunPage })))
const LotteryPage = lazy(() => import('../../pages/MorePage/Lottery/LotteryPage').then((m) => ({ default: m.LotteryPage })))
const TogetherPage = lazy(() => import('../../pages/MorePage/Together/TogetherPage').then((m) => ({ default: m.TogetherPage })))
const SoundsPage = lazy(() => import('../../pages/UsefulPage/Sounds/SoundsPage').then((m) => ({ default: m.SoundsPage })))
const HelpPage = lazy(() => import('../../pages/HelpPage/HelpPage').then((m) => ({ default: m.HelpPage })))
const MotionDevPage = lazy(() => import('../../pages/MotionDevPage/MotionDevPage').then((m) => ({ default: m.MotionDevPage })))
const DevComponentsPage = lazy(() =>
  import('../../pages/DevComponentsPage/DevComponentsPage').then((m) => ({ default: m.DevComponentsPage })),
)

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

export const AppRouter = () => {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<StartRedirect />} />
          <Route path="/today" element={<DailyPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/notes" element={<Navigate to="/useful/productivity/notes" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/training" element={<Navigate to="/useful/training" replace />} />
          <Route path="/clowns" element={<Navigate to="/useful/fun" replace />} />
          <Route path="/fun" element={<Navigate to="/useful/fun" replace />} />
          <Route path="/subscriptions" element={<Navigate to="/useful/finance/subscriptions" replace />} />
          <Route path="/languages" element={<Navigate to="/useful/languages" replace />} />
          <Route path="/basic-english" element={<Navigate to="/useful/languages?tab=basicEnglish" replace />} />
          <Route path="/georgian" element={<Navigate to="/useful/languages?tab=georgian" replace />} />
          <Route path="/english" element={<Navigate to="/useful/languages?tab=english" replace />} />
          <Route path="/lottery" element={<Navigate to="/useful/lottery" replace />} />
          <Route path="/together" element={<Navigate to="/useful/together" replace />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/help" element={<HelpPage />} />
          {import.meta.env.DEV && <Route path="/dev/motion" element={<MotionDevPage />} />}
          {import.meta.env.DEV && <Route path="/dev/components" element={<DevComponentsPage />} />}
          <Route path="/useful" element={<UsefulPage />}>
            <Route index element={<Navigate to="/useful/training" replace />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="finance" element={<FinancePage />}>
              <Route index element={<Navigate to="/useful/finance/operations" replace />} />
              <Route path="operations" element={<FinanceOperationsTab />} />
              <Route path="deposits" element={<FinanceDepositsTab />} />
              <Route path="loans" element={<FinanceLoansTab />} />
              <Route path="subscriptions" element={<FinanceSubscriptionsTab />} />
              <Route path="advice" element={<FinanceAdviceTab />} />
            </Route>
            <Route path="subscriptions" element={<Navigate to="/useful/finance/subscriptions" replace />} />
            <Route path="languages" element={<LanguagesPage />} />
            <Route path="basic-english" element={<Navigate to="/useful/languages?tab=basicEnglish" replace />} />
            <Route path="georgian" element={<Navigate to="/useful/languages?tab=georgian" replace />} />
            <Route path="english" element={<Navigate to="/useful/languages?tab=english" replace />} />
            <Route path="sounds" element={<SoundsPage />} />
            <Route path="clowns" element={<Navigate to="/useful/fun" replace />} />
            <Route path="fun" element={<FunPage />} />
            <Route path="lottery" element={<LotteryPage />} />
            <Route path="together" element={<TogetherPage />} />
            <Route path="productivity" element={<ProductivityPage />}>
              <Route index element={<Navigate to="/useful/productivity/task" replace />} />
              <Route path="task" element={<TasksPage />} />
              <Route path="goal" element={<GoalsPage />} />
              <Route path="dream" element={<DreamsPage />} />
              <Route path="notes" element={<NotesTab />} />
              <Route path="mood" element={<Navigate to="/useful/mind/mood" replace />} />
              <Route path="status" element={<StatusPage />} />
            </Route>
            <Route path="mind" element={<MindPage />}>
              <Route index element={<Navigate to="/useful/mind/dreams" replace />} />
              <Route path="dreams" element={<DreamsDiaryTab />} />
              <Route path="mood" element={<MoodPage />} />
            </Route>
            <Route path="remind" element={<RemindPage />}>
              <Route index element={<Navigate to="/useful/remind/birthdays" replace />} />
              <Route path="birthdays" element={<BirthdaysTab />} />
            </Route>
            <Route path="media" element={<MediaPage />}>
              <Route index element={<Navigate to="/useful/media/movies" replace />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="games" element={<GamesPage />} />
            </Route>
          </Route>
          <Route path="/animal/:id" element={<AnimalPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </Suspense>
  )
}

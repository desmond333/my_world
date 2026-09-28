import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { findCity } from '../data'
import { MINUTE_MS, useNow } from '../hooks'
import { getSeason } from '../lib'
import { useAnimalsStore, useDailyStore } from '../store'
import { AnimalPage } from '../pages/AnimalPage/AnimalPage'
import { DailyPage } from '../pages/DailyPage/DailyPage'
import { ExtraPage } from '../pages/ExtraPage/ExtraPage'
import { CreatorPage } from '../pages/CreatorPage/CreatorPage'
import { DreamsPage } from '../pages/ExtraPage/Productivity/Dreams/DreamsPage'
import { FinancePage } from '../pages/ExtraPage/Finance/FinancePage'
import { GoalsPage } from '../pages/ExtraPage/Productivity/Goals/GoalsPage'
import { LotteryPage } from '../pages/ExtraPage/Lottery/LotteryPage'
import { MediaPage } from '../pages/ExtraPage/Media/MediaPage'
import { BooksPage } from '../pages/ExtraPage/Media/Books/BooksPage'
import { GamesPage } from '../pages/ExtraPage/Media/Games/GamesPage'
import { MoviesPage } from '../pages/ExtraPage/Media/Movies/MoviesPage'
import { ProductivityPage } from '../pages/ExtraPage/Productivity/ProductivityPage'
import { StatusPage } from '../pages/ExtraPage/Productivity/Status/StatusPage'
import { TasksPage } from '../pages/ExtraPage/Productivity/Tasks/TasksPage'
import { SubscriptionsPage } from '../pages/ExtraPage/Subscriptions/SubscriptionsPage'

import { FavoritesPage } from '../pages/FavoritesPage/FavoritesPage'
import { TrainingPage } from '../pages/TrainingPage/TrainingPage'

const ThemeSync = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const themeMode = useDailyStore((state) => state.themeMode)
  const now = useNow(MINUTE_MS)
  const season = getSeason(now, findCity(cityId).timezone)

  useEffect(() => {
    document.documentElement.dataset.theme = `${season}-${themeMode ?? 'dark'}`
  }, [season, themeMode])

  return null
}

const NotFound = () => (
  <main className="page-shell">
    <section className="favorites-empty">
      <h2>Такой страницы нет</h2>
      <p>Зато есть животное дня, которое ждёт тебя сегодня.</p>
      <Link className="add-button" to="/">
        На главную
      </Link>
    </section>
  </main>
)

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
    <Routes>
      <Route path="/" element={<DailyPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/training" element={<Navigate to="/extra/training" replace />} />
      <Route path="/creator" element={<CreatorPage />} />
      <Route path="/extra" element={<ExtraPage />}>
        <Route index element={<Navigate to="/extra/training" replace />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="lottery" element={<LotteryPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="productivity" element={<ProductivityPage />}>
          <Route index element={<Navigate to="/extra/productivity/task" replace />} />
          <Route path="task" element={<TasksPage />} />
          <Route path="goal" element={<GoalsPage />} />
          <Route path="dream" element={<DreamsPage />} />
          <Route path="status" element={<StatusPage />} />
        </Route>
        <Route path="media" element={<MediaPage />}>
          <Route index element={<Navigate to="/extra/media/movies" replace />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="games" element={<GamesPage />} />
        </Route>
      </Route>
      <Route path="/animal/:id" element={<AnimalPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
)

export default App

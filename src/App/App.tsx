import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { findCity } from '../data'
import { getSeason } from '../lib'
import { useDailyStore, useAnimalsStore } from '../store'
import { AnimalPage } from '../pages/AnimalPage/AnimalPage'
import { DailyPage } from '../pages/DailyPage/DailyPage'
import { FavoritesPage } from '../pages/FavoritesPage/FavoritesPage'
import { TrainingPage } from '../pages/TrainingPage/TrainingPage'

const ThemeSync = () => {
  const cityId = useDailyStore((state) => state.cityId)
  const themeMode = useDailyStore((state) => state.themeMode ?? 'dark')
  const [now, setNow] = useState(() => new Date())
  const city = findCity(cityId)
  const season = getSeason(now, city.timezone)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = `${season}-${themeMode}`
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
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/animal/:id" element={<AnimalPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
)

export default App

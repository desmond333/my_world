import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAnimalsStore, useAuthStore } from '../store'
import { NewUserHint, FriendsModal } from '../features'
import { CatAssistant } from '../widgets'
import { initOfflineSync } from '../services/api/syncService'
import { ErrorBoundary, ThemeSync } from './providers'
import { AppRouter } from './router'

const AnimalsLoader = () => {
  const load = useAnimalsStore((state) => state.load)
  useEffect(() => {
    void load()
  }, [load])
  return null
}

const AuthLoader = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  useEffect(() => {
    initOfflineSync()
    void checkAuth()
  }, [checkAuth])
  return null
}

export const App = () => (
  <BrowserRouter>
    <ThemeSync />
    <AnimalsLoader />
    <AuthLoader />
    <NewUserHint />
    <CatAssistant />
    <FriendsModal />
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </BrowserRouter>
)

export default App

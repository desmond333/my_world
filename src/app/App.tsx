import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAnimalsStore, useAuthStore, useDailyStore } from '../store'
import { LangProvider } from '../lib/i18n'
import { NewUserHint, FriendsModal } from '../features'
import { CatAssistant } from '../widgets'
import { initOfflineSync } from '../services/api/syncService'
import { ErrorBoundary, PwaUpdater, ThemeSync } from './providers'
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

export const App = () => {
  const lang = useDailyStore((state) => state.lang ?? 'ru')
  const setLang = useDailyStore((state) => state.setLang)
  const toggleLang = useDailyStore((state) => state.toggleLang)

  return (
    <LangProvider lang={lang} setLang={setLang} toggleLang={toggleLang}>
      <BrowserRouter>
        <ThemeSync />
        <AnimalsLoader />
        <AuthLoader />
        <NewUserHint />
        <CatAssistant />
        <FriendsModal />
        <PwaUpdater />
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App

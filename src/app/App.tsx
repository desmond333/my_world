import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { useAuthStore, useDailyStore, useFriendsStore } from '../store'
import { LangProvider } from '../lib/i18n'
import { NewUserHint, FriendsModal, MotionDevPanel } from '../features'
import { CatAssistant } from '../widgets'
import { initOfflineSync } from '../services/api/syncService'
import { ErrorBoundary, MotionDoseProvider, PwaUpdater, ThemeSync } from './providers'
import { AppRouter } from './router'

const AuthLoader = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const fetchReferral = useAuthStore((state) => state.fetchReferral)
  useEffect(() => {
    initOfflineSync()
    void checkAuth().then((ok) => {
      if (!ok) return
      void useFriendsStore.getState().fetchFriends()
      void fetchReferral()
    })
  }, [checkAuth, fetchReferral])
  return null
}

export const App = () => {
  const lang = useDailyStore((state) => state.lang ?? 'ru')
  const setLang = useDailyStore((state) => state.setLang)
  const toggleLang = useDailyStore((state) => state.toggleLang)

  return (
    <LangProvider lang={lang} setLang={setLang} toggleLang={toggleLang}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ThemeSync />
          <AuthLoader />
          <NewUserHint />
          <CatAssistant />
          <FriendsModal />
          <PwaUpdater />
          <ErrorBoundary>
            <MotionDoseProvider>
              <AppRouter />
            </MotionDoseProvider>
          </ErrorBoundary>
          {import.meta.env.DEV && <MotionDevPanel />}
        </BrowserRouter>
      </MotionConfig>
    </LangProvider>
  )
}

export default App

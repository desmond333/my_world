import { useAuthStore } from '../store'

export const usePremiumActive = () => {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'admin' || user?.premium === true
}

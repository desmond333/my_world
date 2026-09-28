import { useEffect, useState } from 'react'

export const SECOND_MS = 1000
export const MINUTE_MS = 60_000

export const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}

import { useEffect, useRef, useState } from 'react'

export type ResourceState<T> = { data: T | null; loading: boolean; error: string }

type ResourceResult<T> = { key: string; data: T | null; error: string }

const isAbort = (error: unknown) => error instanceof Error && error.name === 'AbortError'

const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Не удалось загрузить данные')

export const useAsyncResource = <T>(key: string, loader: (signal: AbortSignal) => Promise<T>, enabled = true): ResourceState<T> => {
  const [result, setResult] = useState<ResourceResult<T> | null>(null)
  const loaderRef = useRef(loader)

  useEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    loaderRef
      .current(controller.signal)
      .then((data) => setResult({ key, data, error: '' }))
      .catch((error: unknown) => {
        if (!isAbort(error)) setResult({ key, data: null, error: messageOf(error) })
      })
    return () => controller.abort()
  }, [enabled, key])

  const fresh = result?.key === key
  return { data: fresh ? (result?.data ?? null) : null, loading: enabled && !fresh, error: fresh ? (result?.error ?? '') : '' }
}

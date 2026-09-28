import { useEffect, useRef, useState } from 'react'

const DEFAULT_MIN_LENGTH = 2
const DEFAULT_DEBOUNCE_MS = 420

export type SearchOptions = { minLength?: number; debounceMs?: number; enabled?: boolean }

export type SearchState<T> = { term: string; items: T[]; loading: boolean; error: string }

type SearchEntry<T> = { items: T[]; error: string }

export const useRemoteSearch = <T>(query: string, search: (term: string, signal: AbortSignal) => Promise<T[]>, options?: SearchOptions) => {
  const minLength = options?.minLength ?? DEFAULT_MIN_LENGTH
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS
  const enabled = options?.enabled ?? true
  const term = query.trim()
  const asked = enabled && term.length >= minLength

  const [cache, setCache] = useState<Record<string, SearchEntry<T>>>({})
  const searchRef = useRef(search)

  useEffect(() => {
    searchRef.current = search
  })

  useEffect(() => {
    if (!asked) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      searchRef
        .current(term, controller.signal)
        .then((items) => setCache((previous) => ({ ...previous, [term]: { items, error: '' } })))
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return
          const message = error instanceof Error ? error.message : 'Поиск не сработал'
          setCache((previous) => ({ ...previous, [term]: { items: [], error: message } }))
        })
    }, debounceMs)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [asked, debounceMs, term])

  const entry = asked ? cache[term] : undefined
  return { term: asked ? term : '', items: entry?.items ?? [], error: entry?.error ?? '', loading: asked && entry === undefined }
}

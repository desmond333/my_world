import { useCallback, useEffect, useRef, useState } from 'react'
import { copyToClipboard } from '../lib/clipboard'

const FEEDBACK_MS = 2200

export type CopyFeedback = { copied: boolean; copyFailed: boolean; copy: (text: string) => Promise<void> }

export const useCopyFeedback = (): CopyFeedback => {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text)
    setCopyFailed(!ok)
    setCopied(ok)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, FEEDBACK_MS)
  }, [])

  return { copied, copyFailed, copy }
}

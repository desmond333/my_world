import { useCallback, useEffect, useState } from 'react'

export type SpeakOptions = {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  id?: string | null
  voice?: SpeechSynthesisVoice | null
  onEnd?: () => void
  onError?: (err?: unknown) => void
}

export type SpeechSynthesisState = {
  speak: (options: SpeakOptions) => void
  cancel: () => void
  pause: () => void
  resume: () => void
  playingId: string | null
  isSpeaking: boolean
  isPaused: boolean
  isSupported: boolean
}

export const useSpeechSynthesis = (): SpeechSynthesisState => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setPlayingId(null)
    setIsSpeaking(false)
    setIsPaused(false)
  }, [isSupported])

  const pause = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [isSupported])

  const speak = useCallback(
    ({ text, lang = 'en-US', rate = 1.0, pitch = 1.0, id = null, voice = null, onEnd, onError }: SpeakOptions) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      if (voice) {
        utterance.voice = voice
      }

      setPlayingId(id)
      setIsSpeaking(true)
      setIsPaused(false)

      utterance.onend = () => {
        setPlayingId(null)
        setIsSpeaking(false)
        setIsPaused(false)
        onEnd?.()
      }

      utterance.onerror = (e) => {
        setPlayingId(null)
        setIsSpeaking(false)
        setIsPaused(false)
        onError?.(e)
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  return {
    speak,
    cancel,
    pause,
    resume,
    playingId,
    isSpeaking,
    isPaused,
    isSupported,
  }
}

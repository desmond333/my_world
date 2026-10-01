let sharedAudioCtx: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      sharedAudioCtx = new AudioCtx()
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume()
    }
    return sharedAudioCtx
  } catch {
    return null
  }
}

export const playCatMeow = () => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(460, now)
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.32)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.36)
  } catch (error) {
    void error
  }
}

export const playCatPurr = () => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    const mainGain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(62, now)

    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(24, now)
    lfoGain.gain.setValueAtTime(18, now)

    lfo.connect(osc.frequency)

    mainGain.gain.setValueAtTime(0.001, now)
    mainGain.gain.linearRampToValueAtTime(0.14, now + 0.1)
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc.connect(mainGain)
    mainGain.connect(ctx.destination)

    lfo.start(now)
    osc.start(now)
    lfo.stop(now + 0.62)
    osc.stop(now + 0.62)
  } catch (error) {
    void error
  }
}

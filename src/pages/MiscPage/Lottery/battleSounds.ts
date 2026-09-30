let audioCtx: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      audioCtx = new AudioCtx()
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume()
    }
    return audioCtx
  } catch {
    return null
  }
}

export const playBattleHorn = () => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'sawtooth'

    osc1.frequency.setValueAtTime(220, now)
    osc1.frequency.linearRampToValueAtTime(330, now + 0.15)
    osc1.frequency.setValueAtTime(330, now + 0.35)
    osc1.frequency.linearRampToValueAtTime(440, now + 0.45)

    osc2.frequency.setValueAtTime(221, now)
    osc2.frequency.linearRampToValueAtTime(331, now + 0.15)
    osc2.frequency.setValueAtTime(331, now + 0.35)
    osc2.frequency.linearRampToValueAtTime(441, now + 0.45)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.16, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.86)
    osc2.stop(now + 0.86)
  } catch (error) {
    void error
  }
}

export const playSwordClash = () => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(840, now)
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.12)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.23)
  } catch (error) {
    void error
  }
}

export const playVictoryFanfare = () => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const notes = [261.63, 329.63, 392.0, 523.25]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.12

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.18, start + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.42)
    })
  } catch (error) {
    void error
  }
}

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    return new AudioCtx()
  } catch {
    return null
  }
}

export type SoundEffectType = 'honk' | 'airhorn' | 'auf' | 'sad' | 'boing' | 'drama'

export type SoundItem = {
  id: SoundEffectType
  name: string
  emoji: string
  hint: string
}

export const SOUND_ITEMS: SoundItem[] = [
  { id: 'honk', name: 'Хонк!', emoji: '🔴', hint: 'Клоунский гудок' },
  { id: 'airhorn', name: 'Аирхорн', emoji: '📢', hint: 'Пацанский клаксон' },
  { id: 'auf', name: 'АУФ!', emoji: '🐺', hint: 'Волчий вой' },
  { id: 'drama', name: 'Драма', emoji: '⚡', hint: 'Дун-дун-дун!' },
  { id: 'sad', name: 'Ва-ва-ва', emoji: '🎺', hint: 'Клоунский фейл' },
  { id: 'boing', name: 'Боинг', emoji: '🌀', hint: 'Пружина сальто' },
]

export const playSoundEffect = (type: SoundEffectType) => {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  switch (type) {
    case 'honk': {
      // Classic rubber bulb horn
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(587.33, now)
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08)
      gain1.gain.setValueAtTime(0.25, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.14)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.14)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(880, now + 0.15)
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.28)
      gain2.gain.setValueAtTime(0.28, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.3)
      break
    }

    case 'airhorn': {
      // Iconic MLG / Reggae multi-burst airhorn
      const bursts = [
        { start: 0, dur: 0.09 },
        { start: 0.11, dur: 0.09 },
        { start: 0.22, dur: 0.09 },
        { start: 0.33, dur: 0.38 },
      ]
      const freq = 466.16 // Bb4

      bursts.forEach(({ start, dur }) => {
        const osc = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        filter.type = 'lowpass'
        filter.frequency.value = 2800

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now + start)

        osc2.type = 'square'
        osc2.frequency.setValueAtTime(freq * 1.006, now + start)

        gain.gain.setValueAtTime(0.2, now + start)
        gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur)

        osc.connect(filter)
        osc2.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + start)
        osc.stop(now + start + dur)
        osc2.start(now + start)
        osc2.stop(now + start + dur)
      })
      break
    }

    case 'auf': {
      // Wolf howl gliding up with gentle vibrato and gliding down
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const vibrato = ctx.createOscillator()
      const vibratoGain = ctx.createGain()

      vibrato.frequency.value = 5.5
      vibratoGain.gain.value = 14
      vibrato.connect(osc.frequency)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(230, now)
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.45)
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.9)
      osc.frequency.exponentialRampToValueAtTime(180, now + 1.3)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.linearRampToValueAtTime(0.28, now + 0.4)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      vibrato.start(now)
      osc.start(now)
      vibrato.stop(now + 1.35)
      osc.stop(now + 1.35)
      break
    }

    case 'drama': {
      // 3 dramatic low brass hits
      const hits = [
        { time: 0, dur: 0.16, f1: 130.81, f2: 155.56 }, // C3 / Eb3
        { time: 0.2, dur: 0.16, f1: 123.47, f2: 146.83 }, // B2 / D3
        { time: 0.42, dur: 0.55, f1: 110.0, f2: 130.81 }, // A2 / C3
      ]

      hits.forEach(({ time, dur, f1, f2 }) => {
        const o1 = ctx.createOscillator()
        const o2 = ctx.createOscillator()
        const g = ctx.createGain()

        o1.type = 'sawtooth'
        o1.frequency.value = f1
        o2.type = 'triangle'
        o2.frequency.value = f2

        g.gain.setValueAtTime(0.24, now + time)
        g.gain.exponentialRampToValueAtTime(0.01, now + time + dur)

        o1.connect(g)
        o2.connect(g)
        g.connect(ctx.destination)

        o1.start(now + time)
        o2.start(now + time)
        o1.stop(now + time + dur)
        o2.stop(now + time + dur)
      })
      break
    }

    case 'sad': {
      // Sad trombone (Wah-wah-wah-waaaah)
      const notes = [
        { f: 293.66, t: 0, d: 0.2 }, // D4
        { f: 277.18, t: 0.22, d: 0.2 }, // C#4
        { f: 261.63, t: 0.44, d: 0.2 }, // C4
        { f: 246.94, t: 0.66, d: 0.6, slide: 215 }, // B3 -> A3
      ]

      notes.forEach(({ f, t, d, slide }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(f, now + t)
        if (slide) {
          osc.frequency.linearRampToValueAtTime(slide, now + t + d)
        }

        gain.gain.setValueAtTime(0.18, now + t)
        gain.gain.exponentialRampToValueAtTime(0.01, now + t + d)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + t)
        osc.stop(now + t + d)
      })
      break
    }

    case 'boing': {
      // Cartoon spring jump
      const osc = ctx.createOscillator()
      const mod = ctx.createOscillator()
      const modGain = ctx.createGain()
      const gain = ctx.createGain()

      mod.frequency.setValueAtTime(32, now)
      mod.frequency.linearRampToValueAtTime(14, now + 0.4)
      modGain.gain.setValueAtTime(80, now)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(210, now)
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.38)

      mod.connect(modGain)
      modGain.connect(osc.frequency)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42)

      osc.connect(gain)
      gain.connect(ctx.destination)

      mod.start(now)
      osc.start(now)
      mod.stop(now + 0.42)
      osc.stop(now + 0.42)
      break
    }
  }
}

type AmbientTrack = 'rain' | 'fire' | 'drone'

let audioCtx: AudioContext | null = null
let currentTrack: AmbientTrack | null = null
let currentNodes: { stop: () => void } | null = null

const getAudioCtx = (): AudioContext | null => {
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

const createNoiseBuffer = (ctx: AudioContext, seconds: number, pink: boolean) => {
  const size = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  if (pink) {
    let b0 = 0
    let b1 = 0
    let b2 = 0
    for (let i = 0; i < size; i += 1) {
      const white = Math.random() * 2 - 1
      b0 = 0.99 * b0 + white * 0.05
      b1 = 0.96 * b1 + white * 0.11
      b2 = 0.86 * b2 + white * 0.25
      data[i] = (b0 + b1 + b2) * 0.22
    }
  } else {
    for (let i = 0; i < size; i += 1) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return buffer
}

const createCrackleBuffer = (ctx: AudioContext, seconds: number) => {
  const size = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let i = 0
  while (i < size) {
    if (Math.random() < 0.0016) {
      const burst = Math.floor(ctx.sampleRate * 0.004)
      const amp = 0.5 + Math.random() * 0.5
      for (let j = 0; j < burst && i + j < size; j += 1) {
        data[i + j] += (Math.random() * 2 - 1) * amp * (1 - j / burst)
      }
      i += burst + Math.floor(ctx.sampleRate * 0.05)
    } else {
      i += 1
    }
  }
  return buffer
}

const fadeStop = (ctx: AudioContext, master: GainNode, stopNodes: () => void) => {
  try {
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
  } catch (e) {
    void e
  }
  setTimeout(stopNodes, 900)
}

export const stopAmbientSound = () => {
  if (currentNodes) {
    try {
      currentNodes.stop()
    } catch (e) {
      void e
    }
    currentNodes = null
  }
  currentTrack = null
}

export const getCurrentAmbientTrack = (): AmbientTrack | null => currentTrack

export const playAmbientSound = (track: AmbientTrack): boolean => {
  const ctx = getAudioCtx()
  if (!ctx) return false

  stopAmbientSound()

  try {
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, ctx.currentTime)
    master.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.4)
    master.connect(ctx.destination)

    const sources: AudioBufferSourceNode[] = []
    const oscillators: OscillatorNode[] = []

    const loopNoise = (buffer: AudioBuffer) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.start()
      sources.push(source)
      return source
    }

    if (track === 'rain') {
      const body = loopNoise(createNoiseBuffer(ctx, 3, false))
      const bodyFilter = ctx.createBiquadFilter()
      bodyFilter.type = 'lowpass'
      bodyFilter.frequency.setValueAtTime(1400, ctx.currentTime)

      const bodyGain = ctx.createGain()
      bodyGain.gain.setValueAtTime(0.3, ctx.currentTime)

      const hiss = loopNoise(createNoiseBuffer(ctx, 3, false))
      const hissFilter = ctx.createBiquadFilter()
      hissFilter.type = 'bandpass'
      hissFilter.frequency.setValueAtTime(5200, ctx.currentTime)
      hissFilter.Q.setValueAtTime(0.7, ctx.currentTime)
      const hissGain = ctx.createGain()
      hissGain.gain.setValueAtTime(0.05, ctx.currentTime)

      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime)
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(320, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(bodyFilter.frequency)
      lfo.start()
      oscillators.push(lfo)

      body.connect(bodyFilter)
      bodyFilter.connect(bodyGain)
      bodyGain.connect(master)
      hiss.connect(hissFilter)
      hissFilter.connect(hissGain)
      hissGain.connect(master)
    } else if (track === 'fire') {
      const rumble = loopNoise(createNoiseBuffer(ctx, 3, true))
      const rumbleFilter = ctx.createBiquadFilter()
      rumbleFilter.type = 'bandpass'
      rumbleFilter.frequency.setValueAtTime(420, ctx.currentTime)
      rumbleFilter.Q.setValueAtTime(0.9, ctx.currentTime)
      const rumbleGain = ctx.createGain()
      rumbleGain.gain.setValueAtTime(0.42, ctx.currentTime)

      const crackle = loopNoise(createCrackleBuffer(ctx, 4))
      const crackleFilter = ctx.createBiquadFilter()
      crackleFilter.type = 'highpass'
      crackleFilter.frequency.setValueAtTime(1600, ctx.currentTime)
      const crackleGain = ctx.createGain()
      crackleGain.gain.setValueAtTime(0.5, ctx.currentTime)

      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime)
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(0.12, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(rumbleGain.gain)
      lfo.start()
      oscillators.push(lfo)

      rumble.connect(rumbleFilter)
      rumbleFilter.connect(rumbleGain)
      rumbleGain.connect(master)
      crackle.connect(crackleFilter)
      crackleFilter.connect(crackleGain)
      crackleGain.connect(master)
    } else {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(700, ctx.currentTime)

      const chordGain = ctx.createGain()
      chordGain.gain.setValueAtTime(0.16, ctx.currentTime)
      filter.connect(chordGain)
      chordGain.connect(master)

      const freqs = [82.41, 110, 164.81]
      const types: OscillatorType[] = ['sine', 'sine', 'triangle']
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        osc.type = types[index]
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        osc.detune.setValueAtTime((index - 1) * 6, ctx.currentTime)
        osc.connect(filter)
        osc.start()
        oscillators.push(osc)
      })

      const swell = ctx.createOscillator()
      swell.frequency.setValueAtTime(0.06, ctx.currentTime)
      const swellGain = ctx.createGain()
      swellGain.gain.setValueAtTime(0.05, ctx.currentTime)
      swell.connect(swellGain)
      swellGain.connect(chordGain.gain)
      swell.start()
      oscillators.push(swell)
    }

    currentNodes = {
      stop: () =>
        fadeStop(ctx, master, () => {
          sources.forEach((source) => {
            try {
              source.stop()
              source.disconnect()
            } catch (e) {
              void e
            }
          })
          oscillators.forEach((osc) => {
            try {
              osc.stop()
              osc.disconnect()
            } catch (e) {
              void e
            }
          })
          master.disconnect()
        }),
    }
    currentTrack = track
    return true
  } catch (err) {
    void err
    return false
  }
}

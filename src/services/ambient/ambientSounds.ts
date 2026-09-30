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
    if (track === 'rain') {
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2)

      whiteNoise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      whiteNoise.start()

      currentNodes = {
        stop: () => {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8)
          setTimeout(() => {
            try {
              whiteNoise.stop()
              whiteNoise.disconnect()
            } catch (e) {
              void e
            }
          }, 850)
        },
      }
      currentTrack = 'rain'
      return true
    }

    if (track === 'fire') {
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0,
        b1 = 0,
        b2 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99 * b0 + white * 0.05
        b1 = 0.96 * b1 + white * 0.11
        b2 = 0.86 * b2 + white * 0.25
        output[i] = (b0 + b1 + b2) * 0.2
      }

      const pinkNoise = ctx.createBufferSource()
      pinkNoise.buffer = noiseBuffer
      pinkNoise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)
      filter.Q.setValueAtTime(1.5, ctx.currentTime)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.2)

      pinkNoise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      pinkNoise.start()

      currentNodes = {
        stop: () => {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8)
          setTimeout(() => {
            try {
              pinkNoise.stop()
              pinkNoise.disconnect()
            } catch (e) {
              void e
            }
          }, 850)
        },
      }
      currentTrack = 'fire'
      return true
    }

    if (track === 'drone') {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(110, ctx.currentTime)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime)

      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.5)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()

      currentNodes = {
        stop: () => {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.9)
          setTimeout(() => {
            try {
              osc1.stop()
              osc2.stop()
              osc1.disconnect()
              osc2.disconnect()
            } catch (e) {
              void e
            }
          }, 950)
        },
      }
      currentTrack = 'drone'
      return true
    }

    return false
  } catch (err) {
    void err
    return false
  }
}

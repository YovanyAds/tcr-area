import { useStore } from '../store/useStore'

// Sonido opcional (desactivado por defecto): "clac" de foco sintetizado con WebAudio, sin archivos.
let ctx: AudioContext | null = null

export const unlockAudio = () => {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

export function playClick(i = 0) {
  if (!useStore.getState().soundOn || !ctx) return
  const t = ctx.currentTime
  const len = 0.09
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let n = 0; n < data.length; n++) data[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / data.length, 6)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1800 + (i % 4) * 220
  filter.Q.value = 1.2
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.5, t)
  // zumbido grave del balasto
  const osc = ctx.createOscillator()
  osc.frequency.value = 100
  const og = ctx.createGain()
  og.gain.setValueAtTime(0.04, t)
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
  src.connect(filter).connect(gain).connect(ctx.destination)
  osc.connect(og).connect(ctx.destination)
  src.start(t)
  osc.start(t)
  osc.stop(t + 0.6)
}

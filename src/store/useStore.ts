import { create } from 'zustand'
import type { HotspotId } from '../content/site'
import { isMobileDevice, prefersReducedMotion } from '../lib/device'

export type Chapter = 'plano' | 'montaje' | 'luces' | 'interior' | 'final'
export type Quality = 'high' | 'low'
export type StandType = 'modular' | 'medida' | 'diseno'
export type StandSize = 20 | 50 | 100 | 160 | 200

export type StandConfig = {
  size: StandSize
  type: StandType
  color: string
  secondFloor: boolean
  meeting: boolean
  storage: boolean
}

type State = {
  /** canvas creado */
  ready: boolean
  /** loader terminado */
  loaded: boolean
  chapter: Chapter
  activeHotspot: HotspotId | null
  hoverHotspot: HotspotId | null
  freeMode: boolean
  tourDone: boolean
  quality: Quality
  isMobile: boolean
  reducedMotion: boolean
  soundOn: boolean
  viewer: number | null
  screenOffset: number
  config: StandConfig
  set: (p: Partial<State>) => void
  setConfig: (p: Partial<StandConfig>) => void
}

export const defaultConfig: StandConfig = {
  size: 160,
  type: 'medida',
  color: '#18212C',
  secondFloor: false,
  meeting: true,
  storage: false,
}

export const useStore = create<State>((set) => ({
  ready: false,
  loaded: false,
  chapter: 'plano',
  activeHotspot: null,
  hoverHotspot: null,
  freeMode: false,
  tourDone: false,
  quality: 'high',
  isMobile: isMobileDevice(),
  reducedMotion: prefersReducedMotion(),
  soundOn: false,
  viewer: null,
  screenOffset: 0,
  config: defaultConfig,
  set: (p) => set(p),
  setConfig: (p) => set((s) => ({ config: { ...s.config, ...p } })),
}))

// Estado de alta frecuencia (cada frame) fuera de React para no provocar renders.
export const scrollState = {
  /** progreso del scroll 0..1 (ya suavizado por Lenis) */
  progress: 0,
  /** progreso que usa la escena (amortiguado en el frame loop) */
  smooth: 0,
  /** progreso del montaje (1 = stand montado; forzado a 1 con movimiento reducido) */
  build: 1,
}

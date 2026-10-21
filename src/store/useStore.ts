import { create } from 'zustand'
import type { HotspotId } from '../content/site'
import { isMobileDevice, isVeryLowEnd, prefersReducedMotion } from '../lib/device'

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
  /** progreso de carga de texturas (lo publica la escena) */
  load: { active: boolean; progress: number; total: number }
  chapter: Chapter
  activeHotspot: HotspotId | null
  hoverHotspot: HotspotId | null
  freeMode: boolean
  tourDone: boolean
  quality: Quality
  isMobile: boolean
  /** versión 2D (sin WebGL o dispositivo muy lento) */
  mode2d: boolean
  reducedMotion: boolean
  soundOn: boolean
  viewer: number | null
  screenOffset: number
  config: StandConfig
  /** el visitante ha tocado el configurador */
  configTouched: boolean
  /** móvil: panel recogido para ver el stand */
  peek: boolean
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
  load: { active: false, progress: 0, total: 0 },
  chapter: 'plano',
  activeHotspot: null,
  hoverHotspot: null,
  freeMode: false,
  tourDone: false,
  quality: 'high',
  isMobile: isMobileDevice(),
  mode2d: isVeryLowEnd(),
  reducedMotion: prefersReducedMotion(),
  soundOn: false,
  viewer: null,
  screenOffset: 0,
  config: defaultConfig,
  configTouched: false,
  peek: false,
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

/** Calidad baja: móvil o dispositivo que no llega a los fps (sin sombras, sin postprocesado, menos luces y piezas). */
export const useLowQuality = () => useStore((s) => s.quality === 'low' || s.isMobile)

import type { Chapter } from '../store/useStore'
import type { HotspotId } from '../content/site'

// Línea de tiempo del scroll, en tantos por uno (0..1).
export const CHAPTERS: { id: Chapter; from: number }[] = [
  { id: 'plano', from: 0 },
  { id: 'montaje', from: 0.15 },
  { id: 'luces', from: 0.45 },
  { id: 'interior', from: 0.55 },
  { id: 'final', from: 0.96 },
]

export const chapterAt = (p: number): Chapter => {
  let c: Chapter = 'plano'
  for (const ch of CHAPTERS) if (p >= ch.from) c = ch.id
  return c
}

// Ventanas [inicio, fin] en las que entra cada pieza del stand.
export const T = {
  grid: [0.0, 0.07],
  neighbours: [0.05, 0.12],
  tape: [0.09, 0.15],
  platform: [0.15, 0.19],
  carpet: [0.185, 0.22],
  walls: [0.22, 0.28],
  trussColumns: [0.28, 0.31],
  trussBeams: [0.305, 0.35],
  counter: [0.35, 0.38],
  screens: [0.375, 0.405],
  furniture: [0.385, 0.41],
  plants: [0.41, 0.43],
  lightbox: [0.43, 0.45],
  spots: [0.45, 0.53],
  lightboxOn: [0.525, 0.55],
} as const

export type Window = readonly [number, number]

/** progreso local 0..1 dentro de una ventana */
export const local = (p: number, [a, b]: Window) => Math.min(1, Math.max(0, (p - a) / (b - a)))

// Curva de cámara: posición y punto de mira en cada parada.
export type CamKey = { at: number; pos: [number, number, number]; look: [number, number, number]; stop?: HotspotId }

export const CAMERA_KEYS: CamKey[] = [
  { at: 0.0, pos: [0, 50, 7], look: [0, 0, 0.5] },
  { at: 0.15, pos: [3, 36, 15], look: [0, 0, 0] },
  { at: 0.3, pos: [20, 18, 24], look: [0, 1, 0] },
  { at: 0.45, pos: [13, 6, 16.5], look: [0, 2, 0] },
  { at: 0.55, pos: [5, 3.2, 14.5], look: [0, 2.8, -1] },
  { at: 0.62, pos: [0, 2.2, 10], look: [0, 2.2, -2] },
  { at: 0.68, pos: [0.2, 2.0, 3.6], look: [-8, 2.1, 0.2], stop: 'services' },
  { at: 0.75, pos: [0, 2.1, 1.2], look: [0, 2.3, -5], stop: 'projects' },
  { at: 0.82, pos: [1.2, 2.5, 1.8], look: [5, 1.0, -2.5], stop: 'process' },
  { at: 0.88, pos: [2.6, 1.9, 8.2], look: [6, 1.4, 3], stop: 'clients' },
  { at: 0.93, pos: [1.2, 1.7, 8.6], look: [0, 4.0, -1], stop: 'about' },
  { at: 1.0, pos: [-0.2, 2.1, 12.8], look: [-2.2, 1.3, 3.5], stop: 'quote' },
]

// Encuadre de cada hotspot cuando se abre su panel.
export const HOTSPOT_VIEWS: Record<HotspotId, { pos: [number, number, number]; look: [number, number, number]; marker: [number, number, number] }> = {
  about: { pos: [1.2, 1.7, 8.6], look: [0, 4.0, -1], marker: [0, 4.95, 0.4] },
  services: { pos: [0.2, 2.0, 3.6], look: [-8, 2.1, 0.2], marker: [-7.6, 3.1, 4.0] },
  projects: { pos: [0, 2.1, 1.6], look: [0, 2.3, -5], marker: [1.2, 3.4, -4.5] },
  process: { pos: [1.0, 2.6, 2.2], look: [5, 1.0, -2.5], marker: [5, 1.75, -2.5] },
  clients: { pos: [2.5, 1.9, 8.2], look: [6, 1.4, 3], marker: [6, 2.95, 3] },
  quote: { pos: [-1.6, 1.8, 9.6], look: [-4.5, 1.05, 3.5], marker: [-4.5, 1.7, 3.5] },
}

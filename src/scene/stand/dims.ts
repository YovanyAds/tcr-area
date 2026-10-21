import type { StandSize } from '../../store/useStore'

// Superficie → ancho × fondo (m). 160 m² es el stand B214 del recorrido.
export const SIZE_DIMS: Record<StandSize, [number, number]> = {
  20: [5, 4],
  50: [10, 5],
  100: [12.5, 8],
  160: [16, 10],
  200: [20, 10],
}

export const BASE_W = 16
export const BASE_D = 10

/** Dimensiones animadas del stand (se amortiguan cada frame hacia las del configurador). */
export const standDims = { w: BASE_W, d: BASE_D }

/** Escala una posición diseñada para 16 × 10 m al tamaño actual del stand. */
export const fit = (v: readonly [number, number, number], w = standDims.w, d = standDims.d): [number, number, number] => [
  (v[0] * w) / BASE_W,
  v[1],
  (v[2] * d) / BASE_D,
]

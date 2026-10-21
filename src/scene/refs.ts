import type * as THREE from 'three'

export type Rect = { x: number; y: number; w: number; h: number }

/**
 * Referencias de la escena accesibles desde la interfaz sin importar three en el bundle inicial.
 * (p. ej. proyectar una pantalla 3D a coordenadas de página para la transición del visor)
 */
export const sceneRefs: { camera: THREE.PerspectiveCamera | null; screenRect: ((index: number) => Rect | null) | null } = {
  camera: null,
  screenRect: null,
}

import type * as THREE from 'three'

/** Referencias de la escena accesibles desde la interfaz (p. ej. para proyectar una pantalla a coordenadas de página). */
export const sceneRefs: { camera: THREE.PerspectiveCamera | null } = { camera: null }

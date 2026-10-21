import * as THREE from 'three'

export const PALETTE = {
  pavilion: '#1E2833',
  ink: '#18212C',
  paper: '#F2F3F1',
  aluminium: '#D7DADB',
  tape: '#F4C20D',
  line: '#6F8FE6',
}

// Materiales compartidos (una sola instancia por material para ahorrar draw calls y shaders).
export const mats = {
  aluminium: new THREE.MeshStandardMaterial({ color: PALETTE.aluminium, metalness: 0.9, roughness: 0.28 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#2a3138', metalness: 0.7, roughness: 0.45 }),
  platform: new THREE.MeshStandardMaterial({ color: '#2b333c', metalness: 0.2, roughness: 0.7 }),
  carpet: new THREE.MeshStandardMaterial({ color: '#3a4350', roughness: 1, metalness: 0 }),
  wall: new THREE.MeshStandardMaterial({ color: PALETTE.paper, roughness: 0.85 }),
  brandWall: new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.6 }),
  paper: new THREE.MeshStandardMaterial({ color: PALETTE.paper, roughness: 0.5 }),
  wood: new THREE.MeshStandardMaterial({ color: '#b08a62', roughness: 0.6 }),
  black: new THREE.MeshStandardMaterial({ color: '#0c1015', roughness: 0.4, metalness: 0.3 }),
  pot: new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.8 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#2f5a3c', roughness: 0.9, flatShading: true }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#cfe3ea', roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.22 }),
  led: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(2.2), toneMapped: false }),
  neighbour: new THREE.MeshStandardMaterial({ color: '#2c3540', roughness: 0.9 }),
  neighbourLight: new THREE.MeshStandardMaterial({ color: '#46505c', roughness: 0.9 }),
}

/** Tipos de stand: cambian el acabado de las paredes. */
export const applyStandType = (type: 'modular' | 'medida' | 'diseno') => {
  if (type === 'modular') {
    mats.wall.color.set('#e4e6e6')
    mats.wall.roughness = 0.5
    mats.wall.metalness = 0.15
  } else if (type === 'medida') {
    mats.wall.color.set(PALETTE.paper)
    mats.wall.roughness = 0.85
    mats.wall.metalness = 0
  } else {
    mats.wall.color.set('#f7f7f5')
    mats.wall.roughness = 0.25
    mats.wall.metalness = 0.05
  }
  mats.wall.needsUpdate = true
}

/** Texto legible sobre un color de marca (tinta o papel). */
export const contrastOn = (hex: string) => {
  const c = new THREE.Color(hex)
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  return l > 0.5 ? PALETTE.ink : PALETTE.paper
}

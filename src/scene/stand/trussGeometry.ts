import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const Y = new THREE.Vector3(0, 1, 0)

const strut = (a: THREE.Vector3, b: THREE.Vector3, r: number, seg: number) => {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const g = new THREE.CylinderGeometry(r, r, len, seg, 1, true)
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize())
  g.applyQuaternion(q)
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
  g.translate(mid.x, mid.y, mid.z)
  return g
}

const cache = new Map<string, THREE.BufferGeometry>()

/**
 * Truss cuadrado de aluminio (4 cordones + celosía en zigzag) a lo largo del eje X, de 0 a `length`.
 * Se cachea por longitud y nivel de detalle.
 */
export function trussGeometry(length: number, lowDetail = false) {
  const key = `${length.toFixed(2)}-${lowDetail}`
  const hit = cache.get(key)
  if (hit) return hit
  const s = 0.29
  const h = s / 2
  const seg = lowDetail ? 4 : 6
  const parts: THREE.BufferGeometry[] = []
  const corners: [number, number][] = [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ]
  for (const [y, z] of corners) parts.push(strut(new THREE.Vector3(0, y, z), new THREE.Vector3(length, y, z), 0.024, seg))
  if (!lowDetail) {
    const step = 0.5
    const n = Math.max(1, Math.round(length / step))
    const dx = length / n
    for (let f = 0; f < 4; f++) {
      const [y1, z1] = corners[f]
      const [y2, z2] = corners[(f + 1) % 4]
      for (let i = 0; i < n; i++) {
        const even = i % 2 === 0
        const a = new THREE.Vector3(i * dx, even ? y1 : y2, even ? z1 : z2)
        const b = new THREE.Vector3((i + 1) * dx, even ? y2 : y1, even ? z2 : z1)
        parts.push(strut(a, b, 0.011, 4))
      }
    }
  }
  const merged = mergeGeometries(parts)!
  parts.forEach((p) => p.dispose())
  cache.set(key, merged)
  return merged
}

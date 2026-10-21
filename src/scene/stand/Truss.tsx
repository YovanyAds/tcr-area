import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useStore } from '../../store/useStore'
import { local, T } from '../../scroll/timeline'
import { heavyDrop } from '../../lib/easing'
import { trussGeometry } from './trussGeometry'
import { mats } from './materials'
import { SIZE_DIMS, standDims } from './dims'

export const TRUSS_H = 4.5
const INSET = 1

/** Estructura de truss: 4 columnas que suben y 4 vigas que caen y encajan una a una. */
export function Truss() {
  const size = useStore((s) => s.config.size)
  const lowQ = useStore((s) => s.quality === 'low')
  const [tw, td] = SIZE_DIMS[size]
  const lenX = Math.max(1, tw - INSET * 2)
  const lenZ = Math.max(1, td - INSET * 2)
  const geoX = useMemo(() => trussGeometry(lenX, lowQ), [lenX, lowQ])
  const geoZ = useMemo(() => trussGeometry(lenZ, lowQ), [lenZ, lowQ])
  const geoCol = useMemo(() => trussGeometry(TRUSS_H, lowQ), [lowQ])

  const cols = useRef<(THREE.Group | null)[]>([])
  const beams = useRef<(THREE.Group | null)[]>([])
  const root = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = scrollState.build
    const hx = standDims.w / 2 - INSET
    const hz = standDims.d / 2 - INSET
    const curX = Math.max(1, standDims.w - INSET * 2)
    const curZ = Math.max(1, standDims.d - INSET * 2)
    const corners: [number, number][] = [
      [-hx, -hz],
      [hx, -hz],
      [hx, hz],
      [-hx, hz],
    ]
    cols.current.forEach((g, i) => {
      if (!g) return
      const [a, b] = T.trussColumns
      const span = (b - a) / 4
      const t = local(p, [a + i * span * 0.7, a + i * span * 0.7 + span * 1.6])
      g.visible = t > 0
      g.position.set(corners[i][0], 0, corners[i][1])
      g.scale.set(1, Math.max(0.0001, heavyDrop(t)), 1)
    })
    beams.current.forEach((g, i) => {
      if (!g) return
      const [a, b] = T.trussBeams
      const span = (b - a) / 4
      const t = local(p, [a + i * span * 0.8, a + i * span * 0.8 + span * 1.4])
      g.visible = t > 0
      const drop = (1 - heavyDrop(t)) * 4
      // vigas: delantera/trasera en X, laterales en Z
      if (i === 0) g.position.set(-hx, TRUSS_H + drop, -hz), (g.scale.x = curX / lenX)
      if (i === 1) g.position.set(-hx, TRUSS_H + drop, hz), (g.scale.x = curX / lenX)
      if (i === 2) g.position.set(-hx, TRUSS_H + drop, -hz), (g.scale.x = curZ / lenZ)
      if (i === 3) g.position.set(hx, TRUSS_H + drop, -hz), (g.scale.x = curZ / lenZ)
    })
  })

  return (
    <group ref={root}>
      {[0, 1, 2, 3].map((i) => (
        <group key={`c${i}`} ref={(g) => void (cols.current[i] = g)} visible={false}>
          <mesh geometry={geoCol} material={mats.aluminium} rotation={[0, 0, Math.PI / 2]} castShadow={!lowQ} />
          <mesh material={mats.darkMetal} position={[0, 0.02, 0]}>
            <boxGeometry args={[0.6, 0.04, 0.6]} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={`b${i}`} ref={(g) => void (beams.current[i] = g)} visible={false}>
          <mesh geometry={i < 2 ? geoX : geoZ} material={mats.aluminium} rotation={i < 2 ? [0, 0, 0] : [0, -Math.PI / 2, 0]} castShadow={!lowQ} />
        </group>
      ))}
    </group>
  )
}

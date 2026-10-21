import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../store/useStore'
import { local, type Window } from '../scroll/timeline'

// Plano de 1 m anclado en su origen para escalarlo a lo largo de cada lado.
const segGeo = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0).rotateX(-Math.PI / 2)

type Props = {
  x: number
  z: number
  w: number
  d: number
  width?: number
  y?: number
  material: THREE.Material
  window: Window
}

/** Rectángulo en el suelo que se dibuja lado a lado según el progreso del scroll. */
export function RectOutline({ x, z, w, d, width = 0.06, y = 0.012, material, window: win }: Props) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const sides = useMemo(
    () => [
      { pos: [x - w / 2, z - d / 2], rot: 0, len: w },
      { pos: [x + w / 2, z - d / 2], rot: -Math.PI / 2, len: d },
      { pos: [x + w / 2, z + d / 2], rot: Math.PI, len: w },
      { pos: [x - w / 2, z + d / 2], rot: Math.PI / 2, len: d },
    ],
    [x, z, w, d],
  )
  // Con textura (cinta) cada lado necesita su propio material para repetir las rayas por metro.
  const sideMats = useMemo(
    () =>
      sides.map(() => {
        const base = material as THREE.MeshBasicMaterial
        if (!base.map) return material
        const m = base.clone()
        m.map = base.map.clone()
        m.map.wrapS = THREE.RepeatWrapping
        return m
      }),
    [sides, material],
  )
  useFrame(() => {
    const t = local(scrollState.smooth, win) * 4
    sides.forEach((s, i) => {
      const m = refs.current[i]
      if (!m) return
      const f = Math.min(1, Math.max(0, t - i))
      m.visible = f > 0
      const len = Math.max(0.0001, s.len * f + (f > 0 ? width / 2 : 0))
      m.scale.set(len, 1, width)
      const sm = sideMats[i] as THREE.MeshBasicMaterial
      if (sm !== material) {
        sm.map!.repeat.x = len / (width * 6)
        sm.opacity = (material as THREE.MeshBasicMaterial).opacity
      }
    })
  })
  return (
    <group position={[0, y, 0]}>
      {sides.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m
          }}
          geometry={segGeo}
          material={sideMats[i]}
          position={[s.pos[0], 0, s.pos[1]]}
          rotation={[0, s.rot, 0]}
          visible={false}
        />
      ))}
    </group>
  )
}

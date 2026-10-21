import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState, useStore } from '../../store/useStore'
import { local, T, type Window } from '../../scroll/timeline'
import { heavyDrop } from '../../lib/easing'
import { mats } from './materials'
import { fit } from './dims'
import { totemTexture } from '../textures'
import { clients } from '../../content/site'

const PLATFORM_H = 0.12

/** Grupo que cae desde arriba en su ventana y sigue su posición relativa al tamaño del stand. */
function Dropped({ win, at, rotY = 0, height = 5, children, enabled = true }: { win: Window; at: [number, number, number]; rotY?: number; height?: number; enabled?: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const scale = useRef(enabled ? 1 : 0)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const t = local(scrollState.build, win)
    scale.current = THREE.MathUtils.damp(scale.current, enabled ? 1 : 0, 8, dt)
    const [x, , z] = fit(at)
    g.position.set(x, PLATFORM_H + at[1] + (1 - heavyDrop(t)) * height, z)
    g.scale.setScalar(Math.max(0.0001, scale.current))
    g.visible = t > 0 && scale.current > 0.01
  })
  return (
    <group ref={ref} rotation={[0, rotY, 0]} visible={false}>
      {children}
    </group>
  )
}

export function Counter() {
  return (
    <Dropped win={T.counter} at={[-4.5, 0, 3.5]} rotY={0.25}>
      <RoundedBox args={[2.8, 1.05, 0.8]} radius={0.05} position={[0, 0.525, 0]} material={mats.paper} castShadow receiveShadow />
      <mesh material={mats.brandWall} position={[0, 0.55, 0.405]}>
        <boxGeometry args={[2.6, 0.75, 0.01]} />
      </mesh>
      <mesh material={mats.wood} position={[0, 1.07, 0]} castShadow>
        <boxGeometry args={[3.0, 0.04, 0.9]} />
      </mesh>
      <mesh material={mats.led} position={[0, 0.06, 0.41]}>
        <boxGeometry args={[2.7, 0.02, 0.01]} />
      </mesh>
    </Dropped>
  )
}

export function MeetingArea() {
  const on = useStore((s) => s.config.meeting)
  const stools = useMemo(() => [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2 + Math.PI / 4), [])
  return (
    <Dropped win={T.furniture} at={[5, 0, -2.5]} enabled={on}>
      <mesh material={mats.wood} position={[0, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 40]} />
      </mesh>
      <mesh material={mats.darkMetal} position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.04, 12]} />
      </mesh>
      <mesh material={mats.darkMetal} position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
      </mesh>
      {stools.map((a, i) => (
        <group key={i} position={[Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95]}>
          <mesh material={mats.paper} position={[0, 0.76, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.17, 0.06, 24]} />
          </mesh>
          <mesh material={mats.darkMetal} position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.74, 8]} />
          </mesh>
          <mesh material={mats.darkMetal} position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
          </mesh>
        </group>
      ))}
    </Dropped>
  )
}

export function Totem() {
  const color = useStore((s) => s.config.color)
  const t = clients.testimonials[0]
  const tex = useMemo(() => totemTexture(color, t.quote, t.author), [color, t])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <Dropped win={T.furniture} at={[6, 0, 3]} rotY={-0.55} height={6}>
      <mesh material={mats.paper} position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.82, 2.4, 0.26]} />
      </mesh>
      <mesh position={[0, 1.2, 0.131]}>
        <planeGeometry args={[0.8, 2.38]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.12} />
      </mesh>
    </Dropped>
  )
}

function Plant({ s = 1 }: { s?: number }) {
  return (
    <group scale={s}>
      <mesh material={mats.pot} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.6, 20]} />
      </mesh>
      <mesh material={mats.leaf} position={[0, 1.0, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
      </mesh>
      <mesh material={mats.leaf} position={[0.18, 1.45, 0.05]} castShadow>
        <icosahedronGeometry args={[0.32, 1]} />
      </mesh>
    </group>
  )
}

export function Plants() {
  const lowQ = useStore((s) => s.quality === 'low')
  const spots: { at: [number, number, number]; s: number }[] = [
    { at: [-7.2, 0, -4.2], s: 1.1 },
    { at: [7.3, 0, 4.4], s: 0.9 },
    { at: [-2.4, 0, 4.4], s: 0.8 },
    { at: [7.2, 0, -0.6], s: 1 },
  ]
  return (
    <>
      {spots.slice(0, lowQ ? 2 : 4).map((p, i) => (
        <Dropped key={i} win={[T.plants[0] + i * 0.004, T.plants[1] + i * 0.002]} at={p.at} height={4}>
          <Plant s={p.s} />
        </Dropped>
      ))}
    </>
  )
}

export { Dropped }

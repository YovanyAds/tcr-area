import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { mats } from './materials'
import { standDims } from './dims'

const box = new THREE.BoxGeometry(1, 1, 1)

/** Muestra/oculta un grupo con una transición de escala desde el suelo. */
function useToggle(on: boolean) {
  const ref = useRef<THREE.Group>(null)
  const v = useRef(on ? 1 : 0)
  useFrame((_, dt) => {
    v.current = THREE.MathUtils.damp(v.current, on ? 1 : 0, 6, dt)
    const g = ref.current
    if (!g) return
    g.visible = v.current > 0.01
    g.scale.y = Math.max(0.0001, v.current)
  })
  return ref
}

/** Segunda planta sobre la mitad trasera derecha, con barandilla de vidrio y escalera. */
export function SecondFloor() {
  const on = useStore((s) => s.config.secondFloor)
  const ref = useToggle(on)
  const deck = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = deck.current
    if (!g) return
    const w = standDims.w / 2 - 0.3
    const d = standDims.d / 2 - 0.3
    g.position.set(standDims.w / 4 + 0.05, 0, -standDims.d / 4 - 0.05)
    g.scale.set(w / 7.7, 1, d / 4.7)
  })
  const steps = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])
  return (
    <group ref={ref}>
      <group ref={deck}>
        <mesh geometry={box} material={mats.platform} position={[0, 3.1, 0]} scale={[7.7, 0.22, 4.7]} castShadow receiveShadow />
        <mesh geometry={box} material={mats.led} position={[0, 3.0, 2.36]} scale={[7.7, 0.02, 0.02]} />
        {[
          [-3.7, -2.2],
          [3.7, -2.2],
          [-3.7, 2.2],
          [3.7, 2.2],
        ].map(([x, z], i) => (
          <mesh key={i} geometry={box} material={mats.aluminium} position={[x, 1.55, z]} scale={[0.14, 3.1, 0.14]} />
        ))}
        <mesh geometry={box} material={mats.glass} position={[0, 3.7, 2.33]} scale={[7.7, 1, 0.03]} />
        <mesh geometry={box} material={mats.glass} position={[-3.83, 3.7, 0]} scale={[0.03, 1, 4.7]} />
        <mesh geometry={box} material={mats.aluminium} position={[0, 4.22, 2.33]} scale={[7.7, 0.05, 0.06]} />
        {steps.map((i) => (
          <mesh key={i} geometry={box} material={mats.wood} position={[-3.2 + i * 0.26, 0.13 + i * 0.25, 2.95]} scale={[0.28, 0.06, 1]} />
        ))}
      </group>
    </group>
  )
}

/** Almacén cerrado en la esquina trasera izquierda. */
export function Storage() {
  const on = useStore((s) => s.config.storage)
  const ref = useToggle(on)
  const inner = useRef<THREE.Group>(null)
  useFrame(() => {
    inner.current?.position.set(-standDims.w / 2 + 1.45, 0.12, -standDims.d / 2 + 1.2)
  })
  return (
    <group ref={ref}>
      <group ref={inner}>
        <mesh geometry={box} material={mats.wall} position={[1.25, 1.5, 0]} scale={[0.1, 3, 2.2]} castShadow />
        <mesh geometry={box} material={mats.wall} position={[0, 1.5, 1.1]} scale={[2.6, 3, 0.1]} castShadow />
        <mesh geometry={box} material={mats.wood} position={[0.45, 1.05, 1.16]} scale={[0.9, 2.1, 0.03]} />
        <mesh geometry={box} material={mats.aluminium} position={[0.1, 1.05, 1.19]} scale={[0.03, 0.2, 0.03]} />
        <mesh geometry={box} material={mats.wall} position={[0, 3.02, 0]} scale={[2.6, 0.06, 2.3]} />
      </group>
    </group>
  )
}

/** Stand "de diseño": cinta curva suspendida en color de marca en lugar del truss. */
export function DesignRibbon() {
  const on = useStore((s) => s.config.type === 'diseno')
  const ref = useToggle(on)
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * 6.6, 4.4 + Math.sin(a * 3) * 0.35, Math.sin(a) * 3.8))
    }
    const curve = new THREE.CatmullRomCurve3(pts, true)
    const shape = new THREE.Shape()
    shape.moveTo(-0.05, -0.45)
    shape.lineTo(0.05, -0.45)
    shape.lineTo(0.05, 0.45)
    shape.lineTo(-0.05, 0.45)
    return new THREE.ExtrudeGeometry(shape, { steps: 200, bevelEnabled: false, extrudePath: curve })
  }, [])
  const inner = useRef<THREE.Group>(null)
  useFrame(() => inner.current?.scale.set(standDims.w / 16, 1, standDims.d / 10))
  return (
    <group ref={ref}>
      <group ref={inner}>
        <mesh geometry={geo} material={mats.brandWall} castShadow />
      </group>
    </group>
  )
}

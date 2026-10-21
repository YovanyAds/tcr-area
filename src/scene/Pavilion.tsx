import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useStore } from '../store/useStore'
import { local } from '../scroll/timeline'
import { mats } from './stand/materials'
import { NEIGHBOURS } from './Blueprint'

const box = new THREE.BoxGeometry(1, 1, 1)

/** Pabellón ferial de noche: suelo, cubierta con cerchas, luminarias y stands vecinos. */
export function Pavilion() {
  const lowQ = useStore((s) => s.quality === 'low')
  const neighbours = useRef<THREE.Group>(null)
  const roofRef = useRef<THREE.Group>(null)

  // Vecinos: tarima + pared trasera + pared lateral, con alturas variadas.
  const parts = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number]; light?: boolean }[] = []
    NEIGHBOURS.forEach(([x, z, w, d], i) => {
      const h = 2.5 + ((i * 37) % 5) * 0.4
      const back = z <= 0 ? -1 : 1
      out.push({ p: [x, 0.05, z], s: [w, 0.1, d] })
      out.push({ p: [x, h / 2, z + (back * d) / 2], s: [w, h, 0.2], light: i % 3 === 0 })
      out.push({ p: [x - w / 2 + 0.1, h / 2, z + (back * d) / 4], s: [0.2, h, d / 2] })
    })
    return out
  }, [])

  // Cerchas de la cubierta y luminarias
  const roof = useMemo(() => {
    const beams: [number, number, number][] = []
    for (let x = -60; x <= 60; x += 12) beams.push([x, 14, 0])
    return beams
  }, [])

  useFrame(({ camera }) => {
    // la cubierta solo se ve cuando la cámara está por debajo (en la vista cenital la "atravesamos")
    if (roofRef.current) roofRef.current.visible = camera.position.y < 13
    const g = neighbours.current
    if (!g) return
    const t = local(scrollState.build, [0.16, 0.4])
    g.scale.y = Math.max(0.0001, t)
    g.visible = t > 0
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 160]} />
        <meshStandardMaterial color="#161d25" roughness={0.82} metalness={0.1} />
      </mesh>
      <group ref={neighbours}>
        {parts.map((q, i) => (
          <mesh key={i} geometry={box} material={q.light ? mats.neighbourLight : mats.neighbour} position={q.p} scale={q.s} />
        ))}
      </group>
      <group ref={roofRef}>
      {!lowQ &&
        roof.map((p, i) => (
          <group key={i} position={p}>
            <mesh geometry={box} material={mats.darkMetal} scale={[0.25, 0.9, 140]} />
            {[-40, -20, 0, 20, 40].map((z) => (
              <mesh key={z} position={[0, -0.6, z]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.08, 16]} />
                <meshBasicMaterial color={new THREE.Color('#9fb3c8').multiplyScalar(0.35)} toneMapped={false} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

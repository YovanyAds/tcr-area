import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { scrollState } from '../store/useStore'
import { local } from '../scroll/timeline'

RectAreaLightUniformsLib.init()

/**
 * Iluminación del pabellón de noche.
 * Durante el montaje se encienden las luces de trabajo; al llegar a "Luces" se apagan y mandan los focos del stand.
 */
export function Lights() {
  const work = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  useFrame(() => {
    const p = scrollState.build
    const workOn = local(p, [0.12, 0.18]) * (1 - 0.8 * local(p, [0.45, 0.52]))
    if (work.current) work.current.intensity = 0.15 + workOn * 2.6
    if (hemi.current) hemi.current.intensity = 0.4 + workOn * 1.1
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#6f86a8', '#0d1218', 0.4]} />
      <directionalLight ref={work} position={[18, 30, 22]} color="#c9d6e8" intensity={0.2} />
      {/* entorno nocturno procedural (sin descargar HDR externos) para los reflejos del aluminio */}
      <Environment resolution={64} frames={1} environmentIntensity={0.35}>
        <color attach="background" args={['#0b1016']} />
        <Lightformer form="rect" intensity={2.2} color="#9fb6d6" position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffe2b0" position={[-8, 3, 6]} rotation={[0, Math.PI / 3, 0]} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#6F8FE6" position={[8, 4, -6]} scale={3} />
      </Environment>
    </>
  )
}

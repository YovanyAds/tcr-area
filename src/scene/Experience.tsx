import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState, useStore } from '../store/useStore'
import { Pavilion } from './Pavilion'
import { Blueprint } from './Blueprint'
import { Stand } from './stand/Stand'
import { Lights } from './Lights'
import { Effects } from './Effects'
import { CameraRig } from './CameraRig'
import { Hotspots } from './Hotspots'

/** Amortigua el progreso del scroll y decide el progreso del montaje. */
function ProgressDamper() {
  useFrame((_, dt) => {
    const s = useStore.getState()
    const target = scrollState.progress
    scrollState.smooth = s.reducedMotion ? target : THREE.MathUtils.damp(scrollState.smooth, target, 7, Math.min(dt, 0.1))
    if (Math.abs(scrollState.smooth - target) < 0.00005) scrollState.smooth = target
    // con movimiento reducido, en exploración libre o con un panel abierto el stand está montado:
    // si el visitante abre una sección a mitad del montaje, el stand termina de montarse solo
    if (s.reducedMotion) scrollState.build = 1
    else if (s.freeMode || s.activeHotspot) scrollState.build = Math.min(1, scrollState.build + Math.min(dt, 0.1) * 0.45)
    else scrollState.build = scrollState.build > scrollState.smooth + 0.002 ? THREE.MathUtils.damp(scrollState.build, scrollState.smooth, 3, Math.min(dt, 0.1)) : scrollState.smooth
  }, -1)
  return null
}

export default function Experience() {
  const quality = useStore((s) => s.quality)
  const isMobile = useStore((s) => s.isMobile)
  const set = useStore((s) => s.set)
  const high = quality === 'high' && !isMobile

  return (
    <Canvas
      className="scene"
      shadows={high}
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: !high, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 42, position: [0, 52, 0.01], near: 0.1, far: 260 }}
      aria-hidden="true"
      tabIndex={-1}
      onCreated={() => set({ ready: true })}
    >
      <color attach="background" args={['#0f151c']} />
      <fogExp2 attach="fog" args={['#0f151c', 0.0105]} />
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => set({ quality: 'low' })}
        onFallback={() => set({ quality: 'low' })}
      />
      <AdaptiveDpr pixelated={false} />
      <ProgressDamper />
      <CameraRig />
      <Lights />
      <Pavilion />
      <Blueprint />
      <Suspense fallback={null}>
        <Stand />
      </Suspense>
      <Hotspots />
      {high && <Effects />}
    </Canvas>
  )
}

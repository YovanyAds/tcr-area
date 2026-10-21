import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { applyStandType, mats } from './materials'
import { SIZE_DIMS, standDims } from './dims'
import { Shell } from './Shell'
import { Truss } from './Truss'
import { Counter, MeetingArea, Plants, Totem } from './Furniture'
import { Screens } from './Screens'
import { Lightbox } from './Lightbox'
import { Spots } from './Spots'
import { DesignRibbon, SecondFloor, Storage } from './Options'

const GLB_URL = '/models/stand.glb'

/** Stand real del cliente (si existe /public/models/stand.glb). */
function GlbStand() {
  const { scene } = useGLTF(GLB_URL)
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [scene])
  return <primitive object={scene} />
}

/** Comprueba si hay un .glb del cliente sin provocar errores 404 en consola si no existe. */
function useGlbAvailable() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    fetch(GLB_URL, { method: 'HEAD' })
      .then((r) => setOk(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')))
      .catch(() => setOk(false))
  }, [])
  return ok
}

export function Stand() {
  const config = useStore((s) => s.config)
  const isMobile = useStore((s) => s.isMobile)
  const glb = useGlbAvailable()
  const target = useRef(SIZE_DIMS[config.size])
  target.current = SIZE_DIMS[config.size]

  useEffect(() => applyStandType(config.type), [config.type])
  useEffect(() => {
    mats.brandWall.color.set(config.color)
  }, [config.color])

  // el suelo y las paredes se escalan con transición hacia el tamaño elegido
  useFrame((_, dt) => {
    standDims.w = THREE.MathUtils.damp(standDims.w, target.current[0], 3.2, dt)
    standDims.d = THREE.MathUtils.damp(standDims.d, target.current[1], 3.2, dt)
  })

  if (glb) {
    return (
      <Suspense fallback={null}>
        <GlbStand />
        <Spots />
      </Suspense>
    )
  }

  return (
    <group>
      <Shell />
      {config.type !== 'diseno' && <Truss />}
      <DesignRibbon />
      <Counter />
      <Suspense fallback={null}>
        <Screens />
      </Suspense>
      <MeetingArea />
      <Totem />
      <Plants />
      <Lightbox />
      {config.type !== 'diseno' && <Spots />}
      {!isMobile && <SecondFloor />}
      {isMobile && config.secondFloor && <SecondFloor />}
      <Storage />
    </group>
  )
}

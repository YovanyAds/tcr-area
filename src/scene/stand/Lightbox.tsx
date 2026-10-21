import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useStore } from '../../store/useStore'
import { local, T } from '../../scroll/timeline'
import { heavyDrop } from '../../lib/easing'
import { mats } from './materials'
import { lightboxTexture } from '../textures'

export const LIGHTBOX_Y = 5.9
const W = 6
const H = 1.3

/** Lightbox elevado con "TCR AREA": baja colgado, rebota y se enciende. */
export function Lightbox() {
  const color = useStore((s) => s.config.color)
  const lowQ = useStore((s) => s.quality === 'low')
  const tex = useMemo(() => lightboxTexture(color), [color])
  useEffect(() => () => tex.dispose(), [tex])
  const face = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex])
  useEffect(() => () => face.dispose(), [face])
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.RectAreaLight>(null)
  const glow = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const p = scrollState.build
    const t = local(p, T.lightbox)
    g.visible = t > 0
    // baja desde el techo; con el rebote se balancea un poco
    const e = heavyDrop(t)
    g.position.y = LIGHTBOX_Y + (1 - e) * 6
    g.rotation.z = t < 1 ? Math.sin(t * 12) * 0.03 * (1 - t) : Math.sin(clock.elapsedTime * 0.6) * 0.002
    const on = local(p, T.lightboxOn)
    // parpadeo de arranque de fluorescente
    const flicker = on > 0 && on < 0.6 ? (Math.sin(on * 80) > 0.2 ? 1 : 0.25) : 1
    const k = 0.07 + on * flicker * 1.9
    face.color.setScalar(k)
    if (light.current) light.current.intensity = on * flicker * 9
    if (glow.current) glow.current.intensity = on * flicker * 6
  })

  return (
    <group ref={group} position={[0, LIGHTBOX_Y, 0]} visible={false}>
      {/* cables */}
      {[-W / 2 + 0.4, W / 2 - 0.4].map((x) => (
        <mesh key={x} position={[x, 4.2, 0]} material={mats.darkMetal}>
          <cylinderGeometry args={[0.008, 0.008, 8, 4]} />
        </mesh>
      ))}
      <mesh material={mats.brandWall} castShadow={!lowQ}>
        <boxGeometry args={[W + 0.1, H + 0.1, 0.28]} />
      </mesh>
      <mesh material={face} position={[0, 0, 0.142]}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh material={face} position={[0, 0, -0.142]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {/* luz que el lightbox proyecta sobre el stand */}
      <rectAreaLight ref={light} width={W} height={H} intensity={0} position={[0, -0.7, 0.2]} rotation={[-Math.PI / 2, 0, 0]} color="#f4f6ff" />
      {!lowQ && <pointLight ref={glow} position={[0, -0.4, 1.2]} distance={9} decay={2} intensity={0} color="#eef2ff" />}
    </group>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useLowQuality, useStore } from '../../store/useStore'
import { local, T } from '../../scroll/timeline'
import { heavyDrop, easeOutCubic } from '../../lib/easing'
import { mats } from './materials'
import { standDims } from './dims'
import { wallGraphicTexture } from '../textures'

const box = new THREE.BoxGeometry(1, 1, 1)
export const WALL_H = 3.5
const WALL_T = 0.2
const PLATFORM_H = 0.12

/** Tarima, moqueta y paredes del stand (con la pared gráfica de servicios). */
export function Shell() {
  const color = useStore((s) => s.config.color)
  const lowQ = useLowQuality()
  const platform = useRef<THREE.Mesh>(null)
  const edge = useRef<THREE.Mesh>(null)
  const carpet = useRef<THREE.Mesh>(null)
  const left = useRef<THREE.Group>(null)
  const back = useRef<THREE.Group>(null)
  const graphic = useRef<THREE.Mesh>(null)

  const graphicTex = useMemo(() => wallGraphicTexture(color), [color])
  useEffect(() => () => graphicTex.dispose(), [graphicTex])

  useFrame(() => {
    const p = scrollState.build
    const { w, d } = standDims

    // Tarima: cae desde arriba
    const tp = local(p, T.platform)
    const yp = (1 - heavyDrop(tp)) * 6
    if (platform.current) {
      platform.current.visible = tp > 0
      platform.current.scale.set(w, PLATFORM_H, d)
      platform.current.position.set(0, PLATFORM_H / 2 + yp, 0)
    }
    if (edge.current) {
      edge.current.visible = tp > 0
      edge.current.scale.set(w + 0.02, 0.02, 0.02)
      edge.current.position.set(0, 0.035 + yp, d / 2 + 0.005)
    }

    // Moqueta: se despliega de atrás hacia delante
    const tc = easeOutCubic(local(p, T.carpet))
    if (carpet.current) {
      carpet.current.visible = tc > 0
      const len = (d - 0.2) * Math.max(0.0001, tc)
      carpet.current.scale.set(w - 0.2, 0.012, len)
      carpet.current.position.set(0, PLATFORM_H + 0.006, -d / 2 + 0.1 + len / 2)
    }

    // Paredes: suben desde el suelo, primero la trasera
    const [a, b] = T.walls
    const mid = (a + b) / 2
    const tb = heavyDrop(local(p, [a, mid + 0.01]))
    const tl = heavyDrop(local(p, [mid - 0.01, b]))
    if (back.current) {
      back.current.visible = tb > 0
      back.current.scale.set(w, Math.max(0.0001, tb), 1)
      back.current.position.set(0, PLATFORM_H, -d / 2 + WALL_T / 2)
    }
    if (left.current) {
      left.current.visible = tl > 0
      left.current.scale.set(1, Math.max(0.0001, tl), d - WALL_T)
      left.current.position.set(-w / 2 + WALL_T / 2, PLATFORM_H, WALL_T / 2)
    }
    if (graphic.current) {
      const gl = Math.min(8, d - 1.6)
      graphic.current.visible = tl > 0.98
      graphic.current.scale.set(gl, gl / 2, 1)
      graphic.current.position.set(-w / 2 + WALL_T + 0.005, PLATFORM_H + 0.25 + gl / 4, 0.4)
    }
  })

  return (
    <group>
      <mesh ref={platform} geometry={box} material={mats.platform} receiveShadow visible={false} />
      <mesh ref={edge} geometry={box} material={mats.led} visible={false} />
      <mesh ref={carpet} geometry={box} material={mats.carpet} receiveShadow visible={false} />
      {/* pared trasera (color de marca): geometría anclada en la base para crecer hacia arriba */}
      <group ref={back} visible={false}>
        <mesh geometry={box} material={mats.brandWall} position={[0, WALL_H / 2, 0]} scale={[1, WALL_H, WALL_T]} receiveShadow castShadow={!lowQ} />
        <mesh geometry={box} material={mats.aluminium} position={[0, WALL_H + 0.02, 0]} scale={[1, 0.04, WALL_T + 0.02]} />
      </group>
      <group ref={left} visible={false}>
        <mesh geometry={box} material={mats.wall} position={[0, WALL_H / 2, 0]} scale={[WALL_T, WALL_H, 1]} receiveShadow castShadow={!lowQ} />
        <mesh geometry={box} material={mats.aluminium} position={[0, WALL_H + 0.02, 0]} scale={[WALL_T + 0.02, 0.04, 1]} />
      </group>
      <mesh ref={graphic} rotation={[0, Math.PI / 2, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={graphicTex} roughness={0.7} />
      </mesh>
    </group>
  )
}

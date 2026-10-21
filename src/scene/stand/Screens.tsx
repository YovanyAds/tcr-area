import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { scrollState, useStore } from '../../store/useStore'
import { local, T } from '../../scroll/timeline'
import { heavyDrop } from '../../lib/easing'
import { mats } from './materials'
import { standDims } from './dims'
import { createScreenMaterial } from '../screenMaterial'
import { photo, projects } from '../../content/site'

export const SCREEN_W = 2.4
export const SCREEN_H = 1.8
const PLATFORM_H = 0.12

/** Posición X de cada pantalla según el ancho del stand. */
const screenX = (i: number) => (i - 1) * Math.min(2.9, standDims.w / 3.4)

/** Mundo → posición de una pantalla (para la transición de "expandir pantalla"). */
export const screenRegistry: (THREE.Mesh | null)[] = []

function Screen({ index }: { index: number }) {
  const offset = useStore((s) => s.screenOffset)
  const reduced = useStore((s) => s.reducedMotion)
  const projectIndex = (index + offset) % projects.length
  const tex = useTexture(photo(projects[projectIndex].file, 800))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const mat = useMemo(() => createScreenMaterial(tex), [tex])
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const hovered = useRef(false)

  useEffect(() => () => mat.dispose(), [mat])
  useEffect(() => {
    const img = tex.image as HTMLImageElement | undefined
    if (img?.width) mat.uniforms.uImageAspect.value = img.width / img.height
  }, [tex, mat])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = scrollState.build
    const [a, b] = T.screens
    const span = (b - a) / 3
    const t = local(p, [a + index * span * 0.6, a + index * span * 0.6 + span * 1.8])
    g.visible = t > 0
    g.position.set(screenX(index), PLATFORM_H + 2.05 + (1 - heavyDrop(t)) * 4, -standDims.d / 2 + 0.22)
    // las pantallas se encienden con las luces
    const on = local(p, [T.spots[0] + 0.02 + index * 0.01, T.spots[0] + 0.05 + index * 0.01])
    mat.uniforms.uPower.value = on
  })

  const setSat = (v: number) => {
    if (reduced) mat.uniforms.uSaturation.value = v
    else gsap.to(mat.uniforms.uSaturation, { value: v, duration: 0.6, ease: 'power2.out' })
    gsap.to(mat.uniforms.uHover, { value: v, duration: 0.6, ease: 'power2.out' })
  }

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hovered.current = true
    useStore.getState().set({ hoverHotspot: 'projects' })
    setSat(1)
  }
  const onOut = () => {
    hovered.current = false
    useStore.getState().set({ hoverHotspot: null })
    setSat(0)
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (scrollState.build < 0.99) return
    window.dispatchEvent(new CustomEvent('tcr:open-project', { detail: { index: projectIndex, screen: index } }))
  }

  return (
    <group ref={group} visible={false}>
      <mesh material={mats.black} position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[SCREEN_W + 0.12, SCREEN_H + 0.12, 0.08]} />
      </mesh>
      <mesh
        ref={(m) => {
          mesh.current = m
          screenRegistry[index] = m
        }}
        material={mat}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      </mesh>
    </group>
  )
}

export function Screens() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Screen key={i} index={i} />
      ))}
    </>
  )
}

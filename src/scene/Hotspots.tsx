import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Html } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState, useStore } from '../store/useStore'
import { HOTSPOT_VIEWS } from '../scroll/timeline'
import { hotspots, type HotspotId } from '../content/site'
import { PALETTE } from './stand/materials'
import { fit } from './stand/dims'
import { openHotspot } from '../ui/actions'

const ringGeo = new THREE.RingGeometry(0.17, 0.22, 48)
const dotGeo = new THREE.CircleGeometry(0.07, 24)

function Marker({ id, label }: { id: HotspotId; label: string }) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const hover = useStore((s) => s.hoverHotspot === id)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.tape).multiplyScalar(1.6), toneMapped: false, transparent: true, depthTest: false }), [])
  const pulseMat = useMemo(() => mat.clone(), [mat])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    g.position.set(...fit(HOTSPOT_VIEWS[id].marker))
    const t = (clock.elapsedTime * 0.9 + id.length * 0.13) % 1
    if (pulse.current) {
      pulse.current.scale.setScalar(1 + t * 1.4)
      pulseMat.opacity = (1 - t) * 0.7
    }
    if (ring.current) ring.current.scale.setScalar(hover ? 1.35 : 1)
  })

  const set = useStore.getState().set
  return (
    <group ref={group}>
      <Billboard>
        <mesh
          ref={ring}
          geometry={ringGeo}
          material={mat}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation()
            openHotspot(id, 'scene')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            set({ hoverHotspot: id })
          }}
          onPointerOut={() => set({ hoverHotspot: null })}
        >
          {/* zona de clic más grande que el aro */}
          <mesh>
            <circleGeometry args={[0.45, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </mesh>
        <mesh geometry={dotGeo} material={mat} renderOrder={10} />
        <mesh ref={pulse} geometry={ringGeo} material={pulseMat} renderOrder={9} />
      </Billboard>
      <Html center position={[0, 0.42, 0]} zIndexRange={[20, 0]} className="hotspot-label-wrap" pointerEvents="none">
        <span className={`hotspot-label${hover ? ' is-hover' : ''}`} aria-hidden="true">
          {label}
        </span>
      </Html>
    </group>
  )
}

/** Marcadores 3D de cada sección. Visibles en el interior, el final y la exploración libre. */
export function Hotspots() {
  const chapter = useStore((s) => s.chapter)
  const freeMode = useStore((s) => s.freeMode)
  const active = useStore((s) => s.activeHotspot)
  const visible = (chapter === 'interior' || chapter === 'final' || freeMode) && !active && scrollState.build >= 0.99
  if (!visible) return null
  return (
    <>
      {hotspots.map((h) => (
        <Marker key={h.id} id={h.id} label={h.label} />
      ))}
    </>
  )
}

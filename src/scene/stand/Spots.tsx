import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useLowQuality } from '../../store/useStore'
import { local, T } from '../../scroll/timeline'
import { mats } from './materials'
import { standDims } from './dims'
import { TRUSS_H } from './Truss'
import { playClick } from '../../lib/sound'

type SpotDef = { from: [number, number, number]; to: [number, number, number]; shadow?: boolean }

// Diseñados para 16 × 10 m; se escalan al tamaño actual. Los dos centrales proyectan sombra.
const SPOTS: SpotDef[] = [
  { from: [-5.2, 0, 4], to: [-4.6, 0, 3.0] },
  { from: [-1.7, 0, 4], to: [-0.8, 0, 0.5], shadow: true },
  { from: [1.7, 0, 4], to: [1.5, 0, 0], shadow: true },
  { from: [5.2, 0, 4], to: [5.8, 0, 2.6] },
  { from: [-3, 0, -4], to: [-2.9, 2.0, -4.9] },
  { from: [3, 0, -4], to: [2.9, 2.0, -4.9] },
  { from: [-7, 0, 1], to: [-7.9, 1.6, 0.4] },
  { from: [7, 0, -2], to: [5, 0.6, -2.5] },
]

const coneVert = /* glsl */ `
  varying float vY;
  void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const coneFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vY;
  void main() { gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), pow(vY, 2.2) * uOpacity); }
`

const UP = new THREE.Vector3(0, 1, 0)

function Spot({ def, index, castShadow, withLight }: { def: SpotDef; index: number; castShadow: boolean; withLight: boolean }) {
  const light = useRef<THREE.SpotLight>(null)
  const head = useRef<THREE.Group>(null)
  const cone = useRef<THREE.Mesh>(null)
  const lens = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fffbe8', toneMapped: false }), [])
  const coneMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 0 } },
        vertexShader: coneVert,
        fragmentShader: coneFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const target = useMemo(() => new THREE.Object3D(), [])
  const wasOn = useRef(false)
  const v1 = useMemo(() => new THREE.Vector3(), [])
  const v2 = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const p = scrollState.build
    const [a, b] = T.spots
    const span = (b - a) / 8
    const t = local(p, [a + index * span, a + index * span + span * 0.6])
    const on = t >= 1 ? 1 : t > 0 ? (Math.sin(t * 40) > 0 ? 1 : 0.3) * t : 0
    const visible = local(p, T.trussBeams) >= 1

    const sx = standDims.w / 16
    const sz = standDims.d / 10
    v1.set(def.from[0] * sx, TRUSS_H - 0.35, def.from[2] * sz)
    v2.set(def.to[0] * sx, def.to[1], def.to[2] * sz)
    target.position.copy(v2)
    target.updateMatrixWorld()

    if (head.current) {
      head.current.visible = visible
      head.current.position.copy(v1)
      head.current.quaternion.setFromUnitVectors(UP, v1.clone().sub(v2).normalize())
    }
    if (cone.current) {
      const len = v1.distanceTo(v2)
      cone.current.scale.set(len * 0.42, len, len * 0.42)
      cone.current.position.set(0, -len / 2, 0)
      cone.current.visible = on > 0
    }
    coneMat.uniforms.uOpacity.value = on * 0.085
    lens.color.setRGB(1, 0.98, 0.9).multiplyScalar(0.15 + on * 3)
    if (light.current) {
      light.current.position.copy(v1)
      light.current.intensity = on * 70
    }
    if (on >= 1 && !wasOn.current) playClick(index)
    wasOn.current = on >= 1
  })

  return (
    <>
      <group ref={head} visible={false}>
        <mesh material={mats.black}>
          <cylinderGeometry args={[0.09, 0.12, 0.32, 16]} />
        </mesh>
        <mesh material={lens} position={[0, -0.161, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.105, 20]} />
        </mesh>
        <mesh ref={cone} material={coneMat} visible={false}>
          {/* cono abierto: radio 1 en la base (abajo), 0 en la punta */}
          <cylinderGeometry args={[0.05, 1, 1, 24, 1, true]} />
        </mesh>
      </group>
      {withLight && (
        <spotLight
          ref={light}
          target={target}
          angle={0.55}
          penumbra={0.65}
          decay={2}
          distance={18}
          intensity={0}
          color="#fff3dc"
          castShadow={castShadow}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        />
      )}
      <primitive object={target} />
    </>
  )
}

/** Focos del truss: se encienden uno a uno. En calidad baja, menos luces reales y sin sombras. */
export function Spots() {
  const lowQ = useLowQuality()
  return (
    <>
      {SPOTS.map((def, i) => (
        <Spot key={i} def={def} index={i} castShadow={!lowQ && !!def.shadow} withLight={lowQ ? i === 1 || i === 2 || i === 4 : true} />
      ))}
    </>
  )
}

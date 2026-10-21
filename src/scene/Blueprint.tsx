import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, useStore } from '../store/useStore'
import { local, T } from '../scroll/timeline'
import { PALETTE } from './stand/materials'
import { RectOutline } from './RectOutline'
import { floorLabelTexture, tapeTexture } from './textures'
import { chapters } from '../content/site'

/** Stands vecinos del pabellón: [x, z, ancho, fondo]. */
export const NEIGHBOURS: [number, number, number, number][] = [
  [-18, 0, 16, 10],
  [18, 0, 16, 10],
  [-34, 0, 12, 10],
  [34, 0, 12, 10],
  [0, -15, 20, 10],
  [-18, -15, 12, 10],
  [18, -15, 12, 10],
  [-33, -15, 14, 10],
  [33, -15, 14, 10],
  [0, 15, 12, 10],
  [-15, 15, 14, 10],
  [15, 15, 14, 10],
  [-31, 15, 14, 10],
  [31, 15, 14, 10],
]

const gridVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
const gridFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uReveal;
  uniform float uOpacity;
  varying vec3 vWorld;
  float line(float coord, float width) {
    float d = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    return 1.0 - min(d / width, 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    float minor = max(line(p.x, 1.0), line(p.y, 1.0));
    float major = max(line(p.x / 5.0, 1.8), line(p.y / 5.0, 1.8));
    float r = length(p);
    float front = uReveal * 75.0;
    float mask = 1.0 - smoothstep(front - 6.0, front, r);
    float edge = smoothstep(front - 3.0, front, r) * mask;
    float fade = 1.0 - smoothstep(30.0, 60.0, r);
    float a = clamp(minor * 0.1 + major * 0.45 + edge * 0.7, 0.0, 1.0) * mask * fade * uOpacity;
    gl_FragColor = vec4(uColor * (1.25 + edge * 2.5), a);
  }
`

/** Retícula de plano técnico que se dibuja sola, contornos vecinos y cinta del stand B214. */
export function Blueprint() {
  const grid = useRef<THREE.ShaderMaterial>(null)
  const labelMat = useRef<THREE.MeshBasicMaterial>(null)
  const tapeMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tapeTexture(), toneMapped: false, transparent: true }), [])
  const lineMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.line).multiplyScalar(2.2), transparent: true, opacity: 1, toneMapped: false }),
    [],
  )
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(PALETTE.line) }, uReveal: { value: 0 }, uOpacity: { value: 1 } }),
    [],
  )
  const label = useMemo(() => floorLabelTexture(chapters.plano.standLabel.replace('Stand ', ''), chapters.plano.standArea), [])

  // la retícula se dibuja sola al terminar la carga (y el scroll la completa si el usuario va más rápido)
  const intro = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const p = scrollState.smooth
    if (intro.current === null && useStore.getState().loaded) intro.current = clock.elapsedTime
    const auto = intro.current === null ? 0 : Math.min(1, (clock.elapsedTime - intro.current) / 2.8)
    const autoEased = 1 - Math.pow(1 - auto, 3)
    // R3F copia el objeto de uniforms al material: se actualiza a través del material
    const u = grid.current?.uniforms ?? uniforms
    u.uReveal.value = Math.max(autoEased, local(p, T.grid), useStore.getState().reducedMotion ? 1 : 0)
    // la retícula se atenúa cuando se encienden las luces
    u.uOpacity.value = 1 - 0.8 * local(p, [0.2, 0.45])
    lineMat.opacity = (1 - 0.7 * local(p, [0.25, 0.45]))
    // la cinta se retira al final del montaje
    tapeMat.opacity = 1 - local(p, [0.3, 0.36])
    if (labelMat.current) labelMat.current.opacity = local(p, [0.11, 0.14]) * (1 - local(p, [0.17, 0.2]))
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} renderOrder={1}>
        <planeGeometry args={[160, 140]} />
        <shaderMaterial
          ref={grid}
          vertexShader={gridVert}
          fragmentShader={gridFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {NEIGHBOURS.map(([x, z, w, d], i) => (
        <RectOutline key={i} x={x} z={z} w={w} d={d} material={lineMat} width={0.09} window={[T.neighbours[0] + i * 0.003, T.neighbours[1] + i * 0.002]} />
      ))}
      <RectOutline x={0} z={0} w={16.6} d={10.6} width={0.14} y={0.016} material={tapeMat} window={T.tape} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[11, 5.5]} />
        <meshBasicMaterial ref={labelMat} map={label} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { scrollState, useStore } from '../store/useStore'
import { CAMERA_KEYS, HOTSPOT_VIEWS } from '../scroll/timeline'
import { smootherstep } from '../lib/easing'
import { fit } from './stand/dims'

const posCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal')
const lookCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal')

/**
 * Progreso del scroll → parámetro de la curva. Cada tramo se recorre con smootherstep,
 * así la cámara frena y se detiene un instante en cada punto de interés.
 */
export function curveParam(p: number) {
  const n = CAMERA_KEYS.length - 1
  for (let i = 0; i < n; i++) {
    const a = CAMERA_KEYS[i].at
    const b = CAMERA_KEYS[i + 1].at
    if (p <= b) {
      const t = (p - a) / (b - a)
      // en el tramo aéreo (plano → montaje) la cámara no frena tanto
      const eased = i < 3 ? THREE.MathUtils.lerp(t, smootherstep(t), 0.5) : smootherstep(t)
      return (i + Math.max(0, Math.min(1, eased))) / n
    }
  }
  return 1
}

export const sampleCamera = (p: number, pos: THREE.Vector3, look: THREE.Vector3) => {
  const u = curveParam(p)
  posCurve.getPoint(u, pos)
  lookCurve.getPoint(u, look)
}

/** Cámara: sigue la curva con el scroll, vuela a los hotspots y permite la exploración libre. */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const activeHotspot = useStore((s) => s.activeHotspot)
  const freeMode = useStore((s) => s.freeMode)
  const isMobile = useStore((s) => s.isMobile)
  const reduced = useStore((s) => s.reducedMotion)
  const controls = useRef<OrbitControlsImpl>(null)

  const cur = useMemo(() => ({ pos: new THREE.Vector3(...CAMERA_KEYS[0].pos), look: new THREE.Vector3() }), [])
  const goal = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), [])
  const fly = useRef<{ active: boolean; tween?: gsap.core.Tween }>({ active: false })
  const panel = useRef({ offset: 0 })
  const mode = useRef<'scroll' | 'hotspot' | 'free'>('scroll')
  /** OrbitControls se monta de nuevo al salir de un hotspot: hay que fijar su objetivo al punto de mira actual */
  const needsInit = useRef(false)

  // FOV más abierto en móvil
  useEffect(() => {
    camera.fov = isMobile ? 58 : 42
    camera.near = 0.1
    camera.far = 260
    camera.updateProjectionMatrix()
  }, [camera, isMobile])

  // Vuelo a un hotspot (o de vuelta a la curva)
  useEffect(() => {
    fly.current.tween?.kill()
    const fadeCut = (apply: () => void) => {
      // movimiento reducido: fundido a negro y corte
      window.dispatchEvent(new CustomEvent('tcr:fade', { detail: apply }))
    }
    const from = { pos: cur.pos.clone(), look: cur.look.clone() }
    let to: { pos: THREE.Vector3; look: THREE.Vector3 }
    if (activeHotspot) {
      mode.current = 'hotspot'
      const v = HOTSPOT_VIEWS[activeHotspot]
      to = { pos: new THREE.Vector3(...fit(v.pos)), look: new THREE.Vector3(...fit(v.look)) }
      if (isMobile) to.pos.lerp(to.look, -0.25)
    } else if (mode.current === 'hotspot') {
      to = { pos: new THREE.Vector3(), look: new THREE.Vector3() }
      if (freeMode) {
        to.pos.copy(camera.position)
        to.look.copy(controls.current?.target ?? cur.look)
      } else sampleCamera(scrollState.smooth, to.pos, to.look)
      mode.current = freeMode ? 'free' : 'scroll'
    } else {
      mode.current = freeMode ? 'free' : 'scroll'
      return
    }
    const target = activeHotspot ? (isMobile ? 0 : Math.min(460, size.width * 0.4)) : 0
    if (reduced) {
      fadeCut(() => {
        cur.pos.copy(to.pos)
        cur.look.copy(to.look)
        panel.current.offset = target
        fly.current.active = !!activeHotspot
        needsInit.current = true
      })
      return
    }
    fly.current.active = true
    const k = { t: 0 }
    gsap.to(panel.current, { offset: target, duration: 1.2, ease: 'power3.inOut' })
    fly.current.tween = gsap.to(k, {
      t: 1,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        cur.pos.lerpVectors(from.pos, to.pos, k.t)
        // arco suave: la cámara sube un poco a mitad del vuelo
        cur.pos.y += Math.sin(k.t * Math.PI) * 0.6
        cur.look.lerpVectors(from.look, to.look, k.t)
      },
      onComplete: () => {
        fly.current.active = !!activeHotspot
        if (!activeHotspot) needsInit.current = true
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHotspot])

  // Entrar/salir del modo libre
  useEffect(() => {
    if (freeMode) {
      mode.current = 'free'
      needsInit.current = true
    } else if (!activeHotspot) mode.current = 'scroll'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeMode])

  useFrame(({ clock }, dt) => {
    // desplazamiento de la vista para dejar el objeto centrado en el hueco libre junto al panel
    const off = panel.current.offset
    if (off > 0.5) camera.setViewOffset(size.width + off, size.height, off, 0, size.width, size.height)
    else if (camera.view?.enabled) camera.clearViewOffset()

    if (mode.current === 'free' && !fly.current.active) {
      // límites: dentro del pabellón y por encima del suelo
      const c = controls.current
      if (c && needsInit.current) {
        camera.position.copy(cur.pos)
        c.target.copy(cur.look)
        c.update()
        needsInit.current = false
      }
      if (c) {
        c.target.x = THREE.MathUtils.clamp(c.target.x, -14, 14)
        c.target.z = THREE.MathUtils.clamp(c.target.z, -10, 14)
        c.target.y = THREE.MathUtils.clamp(c.target.y, 0.5, 5)
      }
      camera.position.y = Math.max(0.6, camera.position.y)
      cur.pos.copy(camera.position)
      if (c) cur.look.copy(c.target)
      return
    }

    if (mode.current === 'scroll' && !fly.current.active) {
      const p = scrollState.smooth
      sampleCamera(p, goal.pos, goal.look)
      if (reduced) {
        cur.pos.copy(goal.pos)
        cur.look.copy(goal.look)
      } else {
        cur.pos.x = THREE.MathUtils.damp(cur.pos.x, goal.pos.x, 6, dt)
        cur.pos.y = THREE.MathUtils.damp(cur.pos.y, goal.pos.y, 6, dt)
        cur.pos.z = THREE.MathUtils.damp(cur.pos.z, goal.pos.z, 6, dt)
        cur.look.x = THREE.MathUtils.damp(cur.look.x, goal.look.x, 6, dt)
        cur.look.y = THREE.MathUtils.damp(cur.look.y, goal.look.y, 6, dt)
        cur.look.z = THREE.MathUtils.damp(cur.look.z, goal.look.z, 6, dt)
      }
    }

    camera.position.copy(cur.pos)
    // "respirar" en reposo: un movimiento mínimo, nunca un desplazamiento real
    if (!reduced) {
      const t = clock.elapsedTime
      const amp = cur.pos.y > 10 ? 0.06 : 0.025
      camera.position.x += Math.sin(t * 0.45) * amp
      camera.position.y += Math.sin(t * 0.62) * amp * 0.6
    }
    camera.lookAt(cur.look)
  })

  return freeMode && !activeHotspot ? (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={34}
      maxPolarAngle={Math.PI / 2 - 0.06}
      enablePan
      screenSpacePanning={false}
    />
  ) : null
}

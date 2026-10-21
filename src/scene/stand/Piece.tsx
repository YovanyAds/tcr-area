import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { scrollState } from '../../store/useStore'
import { local, type Window } from '../../scroll/timeline'
import { heavyDrop } from '../../lib/easing'

type Mode = 'drop' | 'rise' | 'unroll' | 'fade'

type Props = {
  window: Window
  mode?: Mode
  /** altura desde la que cae la pieza (modo drop) */
  height?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  children: ReactNode
}

/**
 * Envoltorio que monta una pieza del stand según el scroll.
 * drop: cae desde arriba con peso y rebota al encajar · rise: crece desde el suelo · unroll: se despliega en Z.
 */
export function Piece({ window: win, mode = 'drop', height = 7, position = [0, 0, 0], rotation, children }: Props) {
  const ref = useRef<Group>(null)
  const last = useRef(-1)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const t = local(scrollState.build, win)
    if (t === last.current) return
    last.current = t
    g.visible = t > 0
    const e = heavyDrop(t)
    if (mode === 'drop') {
      g.position.y = position[1] + (1 - e) * height
    } else if (mode === 'rise') {
      g.scale.y = Math.max(0.0001, e)
    } else if (mode === 'unroll') {
      g.scale.z = Math.max(0.0001, Math.min(1, e))
    } else {
      g.scale.setScalar(Math.max(0.0001, e))
    }
  })

  return (
    <group ref={ref} position={position} rotation={rotation} visible={false}>
      {children}
    </group>
  )
}

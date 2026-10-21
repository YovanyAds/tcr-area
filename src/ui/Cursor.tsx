import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import s from './Cursor.module.css'

/** Cursor de escritorio: un punto que se convierte en aro amarillo sobre los hotspots. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const hover = useStore((st) => st.hoverHotspot)

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2
    let y = innerHeight / 2
    let cx = x
    let cy = y
    let raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      dot.current?.classList.add(s.on)
      const t = e.target as HTMLElement
      dot.current?.classList.toggle(s.link, !!t.closest?.('a, button, input, select, textarea, label'))
    }
    const leave = () => dot.current?.classList.remove(s.on)
    const tick = () => {
      cx += (x - cx) * 0.35
      cy += (y - cy) * 0.35
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(tick)
    return () => {
      removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={dot} className={`${s.cursor} ${hover ? s.ring : ''}`} aria-hidden="true">
      <span />
    </div>
  )
}

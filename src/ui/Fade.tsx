import { useEffect, useRef } from 'react'

/** Fundido a negro para los cortes de cámara con movimiento reducido. */
export function Fade() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const on = (e: Event) => {
      const apply = (e as CustomEvent<() => void>).detail
      const el = ref.current
      if (!el) return apply()
      el.style.opacity = '1'
      setTimeout(() => {
        apply()
        requestAnimationFrame(() => (el.style.opacity = '0'))
      }, 260)
    }
    addEventListener('tcr:fade', on)
    return () => removeEventListener('tcr:fade', on)
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, background: '#0f151c', opacity: 0, pointerEvents: 'none', zIndex: 45, transition: 'opacity 0.25s linear' }}
    />
  )
}

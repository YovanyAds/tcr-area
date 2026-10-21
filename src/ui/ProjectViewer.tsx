import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { photo, projects } from '../content/site'
import { track } from '../lib/track'
import { sceneRefs, type Rect } from '../scene/refs'
import s from './ProjectViewer.module.css'

/** Visor de proyecto a pantalla completa: la pantalla (o la miniatura) se expande hasta llenar la vista. */
export function ProjectViewer() {
  const index = useStore((st) => st.viewer)
  const set = useStore((st) => st.set)
  const reduced = useStore((st) => st.reducedMotion)
  const frame = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const origin = useRef<Rect | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [hiRes, setHiRes] = useState(false)

  // abrir desde una pantalla 3D o una miniatura de la galería
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { index: i, screen, el } = (e as CustomEvent<{ index: number; screen?: number; el?: HTMLElement }>).detail
      returnFocus.current = (document.activeElement as HTMLElement) ?? null
      if (el) {
        const r = el.getBoundingClientRect()
        origin.current = { x: r.left, y: r.top, w: r.width, h: r.height }
      } else if (screen !== undefined) origin.current = sceneRefs.screenRect?.(screen) ?? null
      else origin.current = null
      track('project_open', { proyecto: projects[i].name, categoria: projects[i].category, origen: el ? 'galeria' : 'pantalla' })
      setHiRes(false)
      set({ viewer: i })
    }
    addEventListener('tcr:open-project', onOpen)
    return () => removeEventListener('tcr:open-project', onOpen)
  }, [set])

  // animación de entrada
  useEffect(() => {
    if (index === null || !frame.current || !root.current) return
    const f = frame.current
    const o = origin.current
    gsap.killTweensOf([f, root.current])
    gsap.set(f, { clearProps: 'transform,filter' })
    gsap.set(root.current, { opacity: 1, visibility: 'visible' })
    if (o && !reduced) {
      const r = f.getBoundingClientRect()
      gsap.fromTo(
        f,
        { x: o.x - r.left, y: o.y - r.top, scaleX: o.w / r.width, scaleY: o.h / r.height, transformOrigin: '0 0', filter: 'grayscale(1)' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, filter: 'grayscale(0)', duration: 0.95, ease: 'power3.inOut' },
      )
      gsap.fromTo(`.${s.backdrop}`, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      gsap.fromTo(`.${s.meta}, .${s.controls}`, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.7 })
    } else {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      gsap.set([f, `.${s.meta}`, `.${s.controls}`], { clearProps: 'all' })
    }
    setTimeout(() => closeBtn.current?.focus(), 50)
  }, [index, reduced])

  const close = useCallback(() => {
    if (!root.current) return
    gsap.to(root.current, {
      opacity: 0,
      duration: reduced ? 0.2 : 0.4,
      onComplete: () => {
        gsap.set(root.current, { visibility: 'hidden' })
        set({ viewer: null })
        returnFocus.current?.focus?.()
      },
    })
  }, [reduced, set])

  const go = useCallback(
    (d: number) => {
      const cur = useStore.getState().viewer
      if (cur === null) return
      const next = (cur + d + projects.length) % projects.length
      setHiRes(false)
      set({ viewer: next })
      track('project_open', { proyecto: projects[next].name, categoria: projects[next].category, origen: 'visor' })
    },
    [set],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [index, close, go])

  const p = index !== null ? projects[index] : null
  return (
    <div ref={root} className={s.viewer} role="dialog" aria-modal="true" aria-label={p ? `Proyecto ${p.name}` : 'Proyecto'} hidden={index === null}>
      <div className={s.backdrop} onClick={close} />
      {p && (
        <>
          <div ref={frame} className={s.frame}>
            <img src={photo(p.file, 800)} alt="" aria-hidden="true" className={s.low} />
            <img
              key={p.file}
              src={photo(p.file, 1600)}
              alt={`Stand de ${p.name} diseñado por TCR Area`}
              className={`${s.hi} ${hiRes ? s.loaded : ''}`}
              onLoad={() => setHiRes(true)}
              decoding="async"
            />
          </div>
          <div className={s.meta}>
            <h2 className={s.name}>{p.name}</h2>
            <p className={s.info}>
              {p.category} · <span className="num">{p.year}</span>
            </p>
          </div>
          <div className={s.controls}>
            <button onClick={() => go(-1)} aria-label="Proyecto anterior">
              Anterior
            </button>
            <span className="num" aria-live="polite">
              {String(index! + 1).padStart(2, '0')} / {projects.length}
            </span>
            <button onClick={() => go(1)} aria-label="Proyecto siguiente">
              Siguiente
            </button>
            <button ref={closeBtn} className={s.close} onClick={close}>
              Cerrar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

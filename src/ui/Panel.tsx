import { lazy, Suspense, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { hotspots, type HotspotId } from '../content/site'
import { closeHotspot } from './actions'
import { AboutContent, ClientsContent, ProcessContent, ProjectsContent, ServicesContent } from './panels/Content'
import s from './Panel.module.css'

const QuoteContent = lazy(() => import('./panels/Quote'))

const openProject = (index: number, el?: HTMLElement) =>
  window.dispatchEvent(new CustomEvent('tcr:open-project', { detail: { index, el } }))

function Body({ id }: { id: HotspotId }) {
  const hid = 'panel-title'
  switch (id) {
    case 'about':
      return <AboutContent id={hid} />
    case 'services':
      return <ServicesContent id={hid} />
    case 'projects':
      return <ProjectsContent id={hid} onOpen={openProject} />
    case 'process':
      return <ProcessContent id={hid} />
    case 'clients':
      return <ClientsContent id={hid} />
    case 'quote':
      return (
        <Suspense fallback={<p>Cargando…</p>}>
          <QuoteContent id={hid} />
        </Suspense>
      )
  }
}

/** Panel lateral con el contenido de la sección. Esc o "Volver al stand" devuelve la cámara. */
export function Panel() {
  const active = useStore((st) => st.activeHotspot)
  const viewer = useStore((st) => st.viewer)
  const peek = useStore((st) => st.peek)
  const isMobile = useStore((st) => st.isMobile)
  const set = useStore((st) => st.set)
  const ref = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const label = hotspots.find((h) => h.id === active)?.label

  useEffect(() => {
    set({ peek: false })
    if (!active) {
      lastFocus.current?.focus?.()
      return
    }
    lastFocus.current = (document.activeElement as HTMLElement) ?? null
    scroller.current?.scrollTo(0, 0)
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 60)
    return () => clearTimeout(t)
  }, [active, set])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (useStore.getState().viewer !== null) return // el visor se cierra primero
      closeHotspot()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  // foco atrapado dentro del panel mientras está abierto
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !ref.current) return
    const f = ref.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={ref}
      className={`${s.panel} ${active ? s.open : ''} ${peek ? s.peek : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      aria-hidden={!active}
      inert={!active || viewer !== null ? true : undefined}
      onKeyDown={onKeyDown}
    >
      <div className={s.head}>
        <span className={s.section}>{label}</span>
        {isMobile && active === 'quote' && (
          <button className={s.peekBtn} onClick={() => set({ peek: !peek })} aria-pressed={peek}>
            {peek ? 'Ver formulario' : 'Ver mi stand'}
          </button>
        )}
        <button className={s.back} onClick={closeHotspot} data-autofocus>
          Volver al stand
        </button>
      </div>
      <div ref={scroller} className={s.scroll} data-lenis-prevent>
        {active && <Body key={active} id={active} />}
      </div>
    </div>
  )
}

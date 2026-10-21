import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react'
import { useStore } from './store/useStore'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollDriver } from './scroll/ScrollDriver'
import { isMobileDevice, prefersReducedMotion } from './lib/device'
import { Loader } from './ui/Loader'
import { Overlay } from './ui/Overlay'
import { TopBar } from './ui/TopBar'
import { Panel } from './ui/Panel'
import { HotspotNav } from './ui/HotspotNav'
import { Cursor } from './ui/Cursor'
import { Fade } from './ui/Fade'
import { ProjectViewer } from './ui/ProjectViewer'
import { SemanticContent } from './ui/SemanticContent'
import { Fallback2D } from './ui/Fallback2D'

const Experience = lazy(() => import('./scene/Experience'))

/** Si la escena 3D falla (WebGL perdido, GPU bloqueada…), la web cae a la versión 2D. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    useStore.getState().set({ mode2d: true })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App() {
  const set = useStore((s) => s.set)
  const isMobile = useStore((s) => s.isMobile)
  // reacciona a cambios de tamaño (girar el móvil) y de preferencia de movimiento
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => set({ isMobile: isMobileDevice(), reducedMotion: prefersReducedMotion() })
    mq.addEventListener('change', onChange)
    addEventListener('resize', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      removeEventListener('resize', onChange)
    }
  }, [set])
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [isMobile])
  const mode2d = useStore((s) => s.mode2d)
  useEffect(() => {
    document.documentElement.classList.toggle('mode-2d', mode2d)
  }, [mode2d])

  if (mode2d)
    return (
      <>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Fallback2D />
        <ProjectViewer />
      </>
    )

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SceneBoundary>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </SceneBoundary>
      <ScrollDriver />
      <TopBar />
      <Overlay />
      <HotspotNav />
      <Panel />
      <ProjectViewer />
      <Fade />
      <Loader />
      <Cursor />
      <SemanticContent />
      <div id="recorrido" style={{ height: isMobile ? '800vh' : '1000vh', position: 'relative', pointerEvents: 'none' }} aria-hidden="true" />
    </>
  )
}

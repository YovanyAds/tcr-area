import { lazy, Suspense, useEffect } from 'react'
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

const Experience = lazy(() => import('./scene/Experience'))

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
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
      <ScrollDriver />
      <TopBar />
      <Overlay />
      <HotspotNav />
      <Panel />
      <ProjectViewer />
      <Fade />
      <Loader />
      <Cursor />
      <div id="recorrido" style={{ height: isMobile ? '800vh' : '1000vh', position: 'relative', pointerEvents: 'none' }} aria-hidden="true" />
    </>
  )
}

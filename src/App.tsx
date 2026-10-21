import { lazy, Suspense, useEffect } from 'react'
import { useStore } from './store/useStore'
import { ScrollDriver } from './scroll/ScrollDriver'
import { isMobileDevice, prefersReducedMotion } from './lib/device'

const Experience = lazy(() => import('./scene/Experience'))

export default function App() {
  const set = useStore((s) => s.set)
  useEffect(() => {
    set({ isMobile: isMobileDevice(), reducedMotion: prefersReducedMotion() })
  }, [set])
  return (
    <>
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
      <ScrollDriver />
      <main id="recorrido" style={{ height: '1000vh', position: 'relative' }} />
    </>
  )
}

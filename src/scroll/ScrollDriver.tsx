import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState, useStore } from '../store/useStore'
import { chapterAt } from './timeline'
import { lenisRef } from './lenis'
import { track } from '../lib/track'

gsap.registerPlugin(ScrollTrigger)

/**
 * Conecta el scroll con la escena: Lenis suaviza, ScrollTrigger calcula el progreso del recorrido (0..1)
 * sobre el contenedor #recorrido, y aquí se actualiza el capítulo actual.
 */
export function ScrollDriver() {
  useEffect(() => {
    const reduced = useStore.getState().reducedMotion
    const lenis = new Lenis({ duration: reduced ? 0 : 1.15, smoothWheel: !reduced, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const seen = new Set<string>()
    const st = ScrollTrigger.create({
      trigger: '#recorrido',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollState.progress = self.progress
        const ch = chapterAt(self.progress)
        const s = useStore.getState()
        if (s.chapter !== ch) {
          s.set({ chapter: ch })
          if (!seen.has(ch)) {
            seen.add(ch)
            track('chapter_view', { capitulo: ch })
          }
        }
        if (self.progress > 0.985 && !s.tourDone) s.set({ tourDone: true })
      },
    })
    track('chapter_view', { capitulo: 'plano' })
    seen.add('plano')

    // ?p=0.6 salta a un punto del recorrido (útil para revisar y para enlaces directos)
    const q = new URLSearchParams(location.search).get('p')
    if (q !== null) {
      const p = Math.min(1, Math.max(0, parseFloat(q)))
      requestAnimationFrame(() => {
        const el = document.getElementById('recorrido')!
        const max = el.offsetHeight - innerHeight
        lenis.scrollTo(el.offsetTop + max * p, { immediate: true, force: true })
        scrollState.progress = scrollState.smooth = p
        ScrollTrigger.update()
      })
    }

    return () => {
      st.kill()
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])
  return null
}

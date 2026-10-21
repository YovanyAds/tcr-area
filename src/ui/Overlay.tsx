import { useEffect, useRef } from 'react'
import { scrollState, useStore } from '../store/useStore'
import { CAMERA_KEYS, CHAPTERS, local } from '../scroll/timeline'
import { brand, chapters, hotspots } from '../content/site'
import { lenisRef } from '../scroll/lenis'
import { openHotspot } from './actions'
import s from './Overlay.module.css'

/** Ventana de visibilidad con fundidos de entrada y salida. */
const band = (p: number, a: number, b: number, fade = 0.015) =>
  Math.min(local(p, [a - fade, a]), 1 - local(p, [b, b + fade]))

const STOPS = CAMERA_KEYS.filter((k) => k.stop && k.stop !== 'quote')

export const scrollToProgress = (p: number) => {
  const el = document.getElementById('recorrido')
  if (!el || !lenisRef.current) return
  const max = el.offsetHeight - innerHeight
  const reduced = useStore.getState().reducedMotion
  lenisRef.current.scrollTo(el.offsetTop + max * p, { duration: reduced ? 0 : 2.2, immediate: reduced })
}

/** Titulares por capítulo, contador de montaje y tarjetas de cada parada. Se animan con el scroll sin renders de React. */
export function Overlay() {
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const hours = useRef<HTMLSpanElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const active = useStore((st) => st.activeHotspot)
  const freeMode = useStore((st) => st.freeMode)
  const chapter = useStore((st) => st.chapter)
  const loaded = useStore((st) => st.loaded)

  useEffect(() => {
    let raf = 0
    let lastP = -1
    const show = (key: string, v: number, y = 16) => {
      const el = refs.current[key]
      if (!el) return
      el.style.opacity = String(v)
      el.style.transform = `translate3d(0, ${(1 - v) * y}px, 0)`
      el.style.visibility = v <= 0.001 ? 'hidden' : 'visible'
    }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = scrollState.smooth
      if (Math.abs(p - lastP) < 0.00002) return
      lastP = p
      show('intro', 1 - local(p, [0.01, 0.03]))
      show('plano', band(p, 0.035, 0.135))
      show('montaje', band(p, 0.17, 0.42))
      show('counter', band(p, 0.15, 0.46, 0.01), 0)
      show('luces', band(p, 0.485, 0.565))
      STOPS.forEach((k) => show(k.stop!, band(p, k.at - 0.022, k.at + 0.022, 0.012)))
      show('final', local(p, [0.955, 0.985]))
      if (hours.current) hours.current.textContent = String(Math.round(local(p, [0.15, 0.45]) * 72)).padStart(2, '0')
      if (rail.current) rail.current.style.setProperty('--p', String(p))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const set = (key: string) => (el: HTMLElement | null) => {
    refs.current[key] = el
  }
  const hidden = !!active || freeMode

  return (
    <div className={`${s.overlay} ${hidden ? s.hidden : ''} ${loaded ? s.loaded : ''}`}>
      <section ref={set('intro')} className={`${s.block} ${s.intro}`}>
        <h1 className={s.h1}>{brand.claim}</h1>
        <p className={s.hint}>
          <span className={s.mouse} aria-hidden="true" />
          Desliza para montar el stand
        </p>
      </section>

      <section ref={set('plano')} className={s.block} aria-hidden={chapter !== 'plano'}>
        <p className={s.kicker}>
          {chapters.plano.standLabel} · <span className="num">{chapters.plano.standArea}</span>
        </p>
        <h2 className={s.h2}>{chapters.plano.title}</h2>
      </section>

      <section ref={set('montaje')} className={s.block} aria-hidden={chapter !== 'montaje'}>
        <h2 className={s.h2}>{chapters.montaje.title}</h2>
      </section>

      <div ref={set('counter')} className={s.counter} aria-hidden="true">
        <span className={s.counterLabel}>{chapters.montaje.counterLabel}</span>
        <span className={`num ${s.counterValue}`}>
          <span ref={hours}>00</span> h <span className={s.arrow}>/</span> 72 h
        </span>
      </div>

      <section ref={set('luces')} className={s.block} aria-hidden={chapter !== 'luces'}>
        <h2 className={s.h2}>{chapters.luces.title}</h2>
      </section>

      {STOPS.map((k) => {
        const h = hotspots.find((x) => x.id === k.stop)!
        return (
          <section key={h.id} ref={set(h.id)} className={`${s.block} ${s.stop}`}>
            <p className={s.kicker}>{h.label}</p>
            <p className={s.teaser}>{h.teaser}</p>
            <button className={s.open} onClick={() => openHotspot(h.id, 'overlay')}>
              Ver {h.label.toLowerCase()}
            </button>
          </section>
        )
      })}

      <section ref={set('final')} className={`${s.block} ${s.final}`}>
        <h2 className={s.h2}>{chapters.final.title}</h2>
        <p className={s.lead}>{chapters.final.text}</p>
        <div className={s.actions}>
          <button className={s.primary} onClick={() => openHotspot('quote', 'overlay')}>
            Pedir presupuesto
          </button>
          <button className={s.secondary} onClick={() => useStore.getState().set({ freeMode: true })}>
            Explorar libremente
          </button>
        </div>
      </section>

      <nav ref={rail} className={s.rail} aria-label="Capítulos del recorrido">
        <div className={s.railTrack} aria-hidden="true">
          <div className={s.railFill} />
        </div>
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            className={`${s.railItem} ${chapter === c.id ? s.railActive : ''}`}
            style={{ top: `${c.from * 100}%` }}
            onClick={() => scrollToProgress(c.id === 'final' ? 1 : c.from + 0.01)}
            aria-current={chapter === c.id ? 'step' : undefined}
          >
            <span>{CHAPTER_NAMES[c.id]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const CHAPTER_NAMES = { plano: 'Plano', montaje: 'Montaje', luces: 'Luces', interior: 'Dentro', final: 'Tu stand' } as const

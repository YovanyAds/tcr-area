import { useStore } from '../store/useStore'
import { hotspots } from '../content/site'
import { openHotspot } from './actions'
import s from './HotspotNav.module.css'

/** Navegación accesible por las secciones del stand (equivalente en el DOM de los hotspots 3D). */
export function HotspotNav() {
  const chapter = useStore((st) => st.chapter)
  const freeMode = useStore((st) => st.freeMode)
  const active = useStore((st) => st.activeHotspot)
  const hover = useStore((st) => st.hoverHotspot)
  const set = useStore((st) => st.set)
  const visible = (chapter === 'interior' || chapter === 'final' || freeMode) && !active

  return (
    <nav className={`${s.nav} ${visible ? s.visible : ''}`} aria-label="Secciones del stand" inert={active ? true : undefined}>
      <ul>
        {hotspots.map((h) => (
          <li key={h.id}>
            <button
              className={`${s.item} ${hover === h.id ? s.hover : ''} ${h.id === 'quote' ? s.quote : ''}`}
              onClick={() => openHotspot(h.id, 'nav')}
              onMouseEnter={() => set({ hoverHotspot: h.id })}
              onMouseLeave={() => set({ hoverHotspot: null })}
              onFocus={() => set({ hoverHotspot: h.id })}
              onBlur={() => set({ hoverHotspot: null })}
              data-cursor="hotspot"
              aria-label={`${h.label}: ${h.element}`}
            >
              {h.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { useStore } from '../store/useStore'
import { track } from '../lib/track'
import type { HotspotId } from '../content/site'
import { hotspots } from '../content/site'

/** Abre la sección de un hotspot: la cámara vuela y se abre el panel. */
export function openHotspot(id: HotspotId, origen: 'scene' | 'nav' | 'cta' | 'overlay' = 'nav') {
  const s = useStore.getState()
  if (s.activeHotspot === id) return
  track('hotspot_click', { hotspot: id, nombre: hotspots.find((h) => h.id === id)?.label, origen })
  s.set({ activeHotspot: id, hoverHotspot: null })
}

export function closeHotspot() {
  const s = useStore.getState()
  if (!s.activeHotspot) return
  s.set({ activeHotspot: null })
}

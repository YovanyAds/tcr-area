// Medición: empuja eventos a window.dataLayer (Google Tag Manager).
// En GTM crea un activador de "Evento personalizado" por cada nombre de evento.

type Datos = Record<string, string | number | boolean | undefined | null>

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    fbq?: (...args: unknown[]) => void
  }
}

export type Evento = 'chapter_view' | 'hotspot_click' | 'project_open' | 'configurator_change' | 'generate_lead'

export function track(evento: Evento, datos: Datos = {}) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: evento, ...datos })

  // Equivalentes de Meta Pixel (descomentar si el píxel está instalado directamente y no vía GTM):
  // if (window.fbq) {
  //   if (evento === 'generate_lead') window.fbq('track', 'Lead', { content_name: 'presupuesto_stand', ...datos })
  //   else if (evento === 'project_open') window.fbq('track', 'ViewContent', { content_name: datos.proyecto })
  //   else window.fbq('trackCustom', evento, datos)
  // }

  if (import.meta.env.DEV) console.debug('[track]', evento, datos)
}

/** Carga GTM si hay VITE_GTM_ID en .env */
export function loadGTM() {
  const id = import.meta.env.VITE_GTM_ID as string | undefined
  if (!id) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)
}

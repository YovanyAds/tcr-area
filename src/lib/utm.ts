// Captura los parámetros de campaña de la URL (primer contacto de la sesión) para enviarlos con el formulario.
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid', 'li_fat_id'] as const
const STORAGE = 'tcr_utm'

export type Utm = Partial<Record<(typeof KEYS)[number] | 'landing_page' | 'referrer', string>>

export function captureUtm(): Utm {
  let saved: Utm = {}
  try {
    saved = JSON.parse(sessionStorage.getItem(STORAGE) || '{}')
  } catch {
    /* almacenamiento no disponible */
  }
  const params = new URLSearchParams(location.search)
  const fresh: Utm = {}
  for (const k of KEYS) {
    const v = params.get(k)
    if (v) fresh[k] = v.slice(0, 200)
  }
  // si llega una campaña nueva, sustituye a la guardada
  const utm: Utm = Object.keys(fresh).length
    ? { ...fresh, landing_page: location.pathname + location.search, referrer: document.referrer || '' }
    : Object.keys(saved).length
      ? saved
      : { landing_page: location.pathname + location.search, referrer: document.referrer || '' }
  try {
    sessionStorage.setItem(STORAGE, JSON.stringify(utm))
  } catch {
    /* almacenamiento no disponible */
  }
  return utm
}

export const getUtm = (): Utm => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE) || '{}')
  } catch {
    return {}
  }
}

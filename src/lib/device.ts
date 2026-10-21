export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobileDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 820px)').matches || window.matchMedia('(pointer: coarse)').matches)

export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Dispositivos que no pueden con la escena: sin WebGL, poca memoria o pocos núcleos en móvil. */
export const isVeryLowEnd = () => {
  if (!hasWebGL()) return true
  if (new URLSearchParams(location.search).has('2d')) return true
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 4
  return isMobileDevice() && (cores <= 2 || mem <= 1)
}

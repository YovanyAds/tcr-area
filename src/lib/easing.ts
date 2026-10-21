// Easing "con masa": cae rápido, rebasa un poco y se asienta con un pequeño rebote.
export const heavyDrop = (t: number) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  // 0..0.7: caída con aceleración; 0.7..1: rebote amortiguado
  if (t < 0.7) {
    const k = t / 0.7
    return 1.06 * (1 - Math.pow(1 - k, 3))
  }
  const k = (t - 0.7) / 0.3
  return 1 + 0.06 * Math.cos(k * Math.PI * 1.5) * (1 - k)
}

export const smoothstep = (t: number) => t * t * (3 - 2 * t)
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

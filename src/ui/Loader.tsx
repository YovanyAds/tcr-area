import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { fontsReady } from '../scene/textures'
import s from './Loader.module.css'

/** Loader real: progreso de carga de texturas como una cinta de balizamiento que se llena. */
export function Loader() {
  const { progress, active, total } = useProgress()
  const sceneReady = useStore((st) => st.ready)
  const [fonts, setFonts] = useState(false)
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)
  const set = useStore((st) => st.set)

  const [timeout, setTimedOut] = useState(false)
  useEffect(() => {
    fontsReady().then(() => setFonts(true))
    // nunca bloquea más de 9 s: si una textura tarda, la escena sigue y la textura entra al llegar
    const t = setTimeout(() => setTimedOut(true), 9000)
    return () => clearTimeout(t)
  }, [])

  // cuenta: escena (40 %), texturas (50 %), fuentes (10 %)
  const texPart = total > 0 ? progress / 100 : sceneReady ? 1 : 0
  const target = Math.round((sceneReady ? 40 : 15) + texPart * 50 + (fonts ? 10 : 0))
  const done = (sceneReady && fonts && !active && texPart >= 1) || timeout

  // la cinta avanza con una transición CSS: no depende de los fps
  useEffect(() => {
    setShown((v) => Math.max(v, done ? 100 : Math.min(target, 97)))
  }, [target, done])

  useEffect(() => {
    if (shown >= 100 && !gone) {
      const t = setTimeout(() => {
        setGone(true)
        set({ loaded: true })
      }, 650)
      return () => clearTimeout(t)
    }
  }, [shown, gone, set])

  if (gone) return null
  const pct = Math.round(shown)
  return (
    <div className={`${s.loader} ${pct >= 100 ? s.out : ''}`} role="status" aria-live="polite">
      <div className={s.inner}>
        <p className={s.brand}>TCR Area</p>
        <div className={s.tape} aria-hidden="true">
          <div className={s.fill} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className={s.text}>
          Montando el stand… <span className="num">{pct} %</span>
        </p>
      </div>
    </div>
  )
}

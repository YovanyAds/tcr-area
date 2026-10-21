import { useStore } from '../store/useStore'
import { unlockAudio } from '../lib/sound'
import { openHotspot, closeHotspot } from './actions'
import { scrollToProgress } from './Overlay'
import s from './TopBar.module.css'

/** Barra superior: marca, sonido opcional y acceso directo al presupuesto (a un clic desde cualquier punto). */
export function TopBar() {
  const soundOn = useStore((st) => st.soundOn)
  const freeMode = useStore((st) => st.freeMode)
  const active = useStore((st) => st.activeHotspot)
  const set = useStore((st) => st.set)

  return (
    <header className={s.bar}>
      <a
        href="#top"
        className={s.logo}
        aria-label="TCR Area, volver al inicio"
        onClick={(e) => {
          e.preventDefault()
          closeHotspot()
          set({ freeMode: false })
          scrollToProgress(0)
        }}
      >
        <span className={s.mark} aria-hidden="true" />
        TCR Area
      </a>
      <div className={s.right}>
        {freeMode && !active && (
          <button className={s.ghost} onClick={() => set({ freeMode: false })}>
            Volver al recorrido
          </button>
        )}
        <button
          className={s.ghost}
          aria-pressed={soundOn}
          onClick={() => {
            unlockAudio()
            set({ soundOn: !soundOn })
          }}
        >
          <span className={`${s.sound} ${soundOn ? s.soundOn : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={s.soundLabel}>{soundOn ? 'Sonido activado' : 'Sonido'}</span>
        </button>
        <button className={s.cta} onClick={() => openHotspot('quote', 'cta')}>
          Pedir presupuesto
        </button>
      </div>
    </header>
  )
}

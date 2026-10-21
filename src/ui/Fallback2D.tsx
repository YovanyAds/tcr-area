import { SemanticContent } from './SemanticContent'
import { photo, projects } from '../content/site'
import s from './Fallback2D.module.css'

/** Versión 2D para dispositivos sin WebGL o muy lentos: foto principal + todo el contenido. */
export function Fallback2D() {
  const hero = projects[0]
  return (
    <div className={s.wrap}>
      <div className={s.hero} aria-hidden="true">
        <img src={photo(hero.file, 1600)} srcSet={`${photo(hero.file, 800)} 800w, ${photo(hero.file, 1600)} 1200w`} sizes="100vw" alt="" fetchPriority="high" />
      </div>
      <SemanticContent visible onQuote={() => document.getElementById('presupuesto')?.scrollIntoView({ behavior: 'smooth' })} />
    </div>
  )
}

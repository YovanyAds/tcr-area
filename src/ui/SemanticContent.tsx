import { lazy, Suspense } from 'react'
import { brand, chapters, quote } from '../content/site'
import { AboutContent, ClientsContent, ContactBlock, ProcessContent, ProjectsContent, ServicesContent } from './panels/Content'
import s from './SemanticContent.module.css'

const Quote = lazy(() => import('./panels/Quote'))

/**
 * Todo el contenido de la web en HTML semántico (SEO y lectores de pantalla).
 * En la versión 3D queda oculto visualmente; en la versión 2D es la web.
 */
export function SemanticContent({ visible = false, onQuote }: { visible?: boolean; onQuote?: () => void }) {
  return (
    // en la versión 3D está oculto, pero si recibe el foco (teclado, enlace "Saltar al contenido") se muestra como versión de texto
    <main id="contenido" tabIndex={-1} className={visible ? s.visible : s.hidden} data-lenis-prevent>
      <header className={s.hero}>
        <p className={s.kicker}>TCR Area · Stands para ferias</p>
        <h1 className={s.h1}>{brand.claim}</h1>
        <p className={s.lead}>{brand.manifesto}</p>
        <p className={s.lead}>
          {chapters.plano.title} {chapters.luces.title}
        </p>
        {onQuote && (
          <a className={s.cta} href="#presupuesto" onClick={onQuote}>
            Pedir presupuesto
          </a>
        )}
      </header>
      <section className={s.section} aria-labelledby="sem-servicios">
        <ServicesContent id="sem-servicios" />
      </section>
      <section className={s.section} aria-labelledby="sem-proyectos">
        <ProjectsContent id="sem-proyectos" onOpen={(i, el) => window.dispatchEvent(new CustomEvent('tcr:open-project', { detail: { index: i, el } }))} />
      </section>
      <section className={s.section} aria-labelledby="sem-proceso">
        <ProcessContent id="sem-proceso" />
      </section>
      <section className={s.section} aria-labelledby="sem-clientes">
        <ClientsContent id="sem-clientes" />
      </section>
      <section className={s.section} aria-labelledby="sem-nosotros">
        <AboutContent id="sem-nosotros" />
      </section>
      <section id="presupuesto" className={s.section} aria-labelledby="sem-presupuesto">
        <h2 id="sem-presupuesto" className={s.h2}>
          {quote.title}
        </h2>
        <p className={s.lead}>{quote.text}</p>
        {!visible && <ContactBlock />}
        {visible && <QuoteSlot />}
      </section>
      <footer className={s.footer}>
        <p>© TCR Area · Diseño, construcción y montaje de stands para ferias en Barcelona.</p>
      </footer>
    </main>
  )
}

function QuoteSlot() {
  return (
    <Suspense fallback={<ContactBlock />}>
      <Quote />
    </Suspense>
  )
}

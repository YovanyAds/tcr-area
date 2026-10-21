import { useState } from 'react'
import { about, clients, contact, photo, photoSrcSet, process, projects, services, stats, type ProjectCategory } from '../../content/site'
import s from './Content.module.css'

type H = 'h2' | 'h3'

export function AboutContent({ id, h: Heading = 'h2' }: { id?: string; h?: H }) {
  return (
    <div className={s.content}>
      <Heading id={id} className={s.title}>
        {about.title}
      </Heading>
      <p className={s.lead}>{about.text}</p>
      <h3 className={s.sub}>{about.statsTitle}</h3>
      <p className={s.muted}>{about.statsText}</p>
      <dl className={s.stats}>
        {stats.map((st) => (
          <div key={st.label} className={s.stat}>
            <dt className={`num ${s.statValue}`}>{st.value}</dt>
            <dd className={s.statLabel}>{st.label}</dd>
          </div>
        ))}
      </dl>
      <ContactBlock />
    </div>
  )
}

export function ServicesContent({ id, h: Heading = 'h2' }: { id?: string; h?: H }) {
  return (
    <div className={s.content}>
      <Heading id={id} className={s.title}>
        {services.title}
      </Heading>
      <p className={s.lead}>{services.intro}</p>
      <ol className={s.services}>
        {services.items.map((it) => (
          <li key={it.n} className={s.service}>
            <span className={`num ${s.n}`}>{it.n}</span>
            <h3 className={s.sub}>{it.title}</h3>
            <p>{it.text}</p>
            <ul className={s.tags}>
              {it.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

const FILTERS: ('Todos' | ProjectCategory)[] = ['Todos', 'Diseño', 'Construcción', 'Gestión de feria']

export function ProjectsContent({ id, h: Heading = 'h2', onOpen }: { id?: string; h?: H; onOpen?: (index: number, el: HTMLElement) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos')
  return (
    <div className={s.content}>
      <Heading id={id} className={s.title}>
        Stands que ya han pasado por ferias de medio mundo.
      </Heading>
      <p className={s.lead}>Una selección de proyectos para marcas de tecnología, consumo, energía, náutica y lujo.</p>
      <div className={s.filters} role="group" aria-label="Filtrar proyectos">
        {FILTERS.map((f) => (
          <button key={f} className={s.filter} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <ul className={s.gallery}>
        {projects.map((p, i) =>
          filter === 'Todos' || p.category === filter ? (
            <li key={p.file}>
              <button className={s.project} onClick={(e) => onOpen?.(i, e.currentTarget.querySelector('img')!)} aria-label={`Ver proyecto ${p.name}, ${p.category}, ${p.year}`}>
                <img src={photo(p.file, 800)} srcSet={photoSrcSet(p.file)} sizes="(max-width: 820px) 50vw, 220px" alt={`Stand de ${p.name} diseñado por TCR Area`} loading="lazy" decoding="async" width={800} height={600} />
                <span className={s.projectMeta}>
                  <strong>{p.name}</strong>
                  <span>
                    {p.category} · <span className="num">{p.year}</span>
                  </span>
                </span>
              </button>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  )
}

export function ProcessContent({ id, h: Heading = 'h2' }: { id?: string; h?: H }) {
  return (
    <div className={s.content}>
      <Heading id={id} className={s.title}>
        {process.title}
      </Heading>
      <p className={s.lead}>{process.intro}</p>
      <ol className={s.steps}>
        {process.steps.map((st) => (
          <li key={st.n} className={s.step}>
            <span className={`num ${s.stepN}`}>{st.n}</span>
            <div>
              <h3 className={s.stepTitle}>{st.title}</h3>
              <p className={s.muted}>{st.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ClientsContent({ id, h: Heading = 'h2' }: { id?: string; h?: H }) {
  return (
    <div className={s.content}>
      <Heading id={id} className={s.title}>
        Lo que dicen quienes ya han montado con nosotros.
      </Heading>
      {clients.testimonials.map((t) => (
        <figure key={t.author} className={s.quote}>
          <blockquote>
            <p>{t.quote}</p>
          </blockquote>
          <figcaption>{t.author}</figcaption>
        </figure>
      ))}
      <h3 className={s.sub}>Marcas que han confiado en TCR Area</h3>
      <ul className={s.brands}>
        {clients.brands.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  )
}

export function ContactBlock() {
  return (
    <address className={s.contact}>
      <div>
        <h3 className={s.contactTitle}>Dónde estamos</h3>
        {contact.address.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div>
        <h3 className={s.contactTitle}>Contacto</h3>
        <a href={contact.phoneHref}>{contact.phone}</a>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
    </address>
  )
}

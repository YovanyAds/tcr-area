import { useEffect, useId, useRef, useState } from 'react'
import { useStore, type StandSize, type StandType } from '../../store/useStore'
import { quote } from '../../content/site'
import { track } from '../../lib/track'
import { getUtm } from '../../lib/utm'
import { submitLead } from '../../lib/submitLead'
import { ContactBlock } from './Content'
import s from './Quote.module.css'

const SIZES: StandSize[] = [20, 50, 100, 200]
const TYPES: { id: StandType; label: string; hint: string }[] = [
  { id: 'modular', label: 'Modular', hint: 'Reutilizable, montaje rápido' },
  { id: 'medida', label: 'A medida', hint: 'Fabricado para tu marca' },
  { id: 'diseno', label: 'De diseño', hint: 'Formas singulares, sin truss' },
]
const COLORS = ['#18212C', '#C8102E', '#0057B8', '#00875A', '#E87722', '#6D2077']
const OPTIONS: { key: 'secondFloor' | 'meeting' | 'storage'; label: string }[] = [
  { key: 'secondFloor', label: 'Segunda planta' },
  { key: 'meeting', label: 'Zona de reunión' },
  { key: 'storage', label: 'Almacén' },
]

/** m² del configurador → opción equivalente del desplegable de superficie */
const areaOption = (m2: StandSize) => (m2 <= 20 ? quote.areaOptions[1] : m2 <= 50 ? quote.areaOptions[2] : m2 <= 100 ? quote.areaOptions[3] : quote.areaOptions[4])

type Errors = Partial<Record<string, string>>

function Configurator({ onSize }: { onSize: (m2: StandSize) => void }) {
  const config = useStore((st) => st.config)
  const setConfig = useStore((st) => st.setConfig)
  const touched = useStore((st) => st.configTouched)
  const set = useStore((st) => st.set)

  const change = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => {
    setConfig({ [key]: value } as Partial<typeof config>)
    set({ configTouched: true })
    track('configurator_change', { opcion: key, valor: String(value) })
  }

  return (
    <fieldset className={s.config}>
      <legend className={s.legend}>Diseña tu stand</legend>
      <p className={s.help}>Lo que elijas cambia el stand en tiempo real y nos llega con tu solicitud.</p>

      <div className={s.group} role="radiogroup" aria-label="Superficie">
        <span className={s.groupLabel}>Superficie</span>
        <div className={s.segmented}>
          {SIZES.map((m) => (
            <button
              type="button"
              key={m}
              role="radio"
              aria-checked={touched && config.size === m}
              className={s.seg}
              onClick={() => {
                change('size', m)
                onSize(m)
              }}
            >
              <span className="num">{m}</span> m²
            </button>
          ))}
        </div>
      </div>

      <div className={s.group} role="radiogroup" aria-label="Tipo de stand">
        <span className={s.groupLabel}>Tipo</span>
        <div className={s.types}>
          {TYPES.map((t) => (
            <button type="button" key={t.id} role="radio" aria-checked={config.type === t.id} className={s.type} onClick={() => change('type', t.id)}>
              <strong>{t.label}</strong>
              <span>{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.group}>
        <span className={s.groupLabel} id="color-label">
          Color de marca
        </span>
        <div className={s.colors} role="radiogroup" aria-labelledby="color-label">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              role="radio"
              aria-checked={config.color.toLowerCase() === c.toLowerCase()}
              aria-label={`Color ${c}`}
              className={s.swatch}
              style={{ background: c }}
              onClick={() => change('color', c)}
            />
          ))}
          <label className={s.picker}>
            <input type="color" value={config.color} onChange={(e) => change('color', e.target.value)} aria-label="Elegir otro color" />
            <span>Otro</span>
          </label>
        </div>
      </div>

      <div className={s.group}>
        <span className={s.groupLabel}>Opciones</span>
        <div className={s.options}>
          {OPTIONS.map((o) => (
            <label key={o.key} className={s.check}>
              <input type="checkbox" checked={config[o.key]} onChange={(e) => change(o.key, e.target.checked)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  )
}

export default function QuoteContent({ id }: { id?: string }) {
  const config = useStore((st) => st.config)
  const touched = useStore((st) => st.configTouched)
  const [area, setArea] = useState(quote.areaOptions[0])
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  const f = (name: string) => `${uid}-${name}`

  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus()
  }, [status])

  const validate = (fd: FormData): Errors => {
    const e: Errors = {}
    const req = (k: string, msg: string) => {
      if (!String(fd.get(k) || '').trim()) e[k] = msg
    }
    req('nombre', 'Escribe tu nombre.')
    req('empresa', 'Indica tu empresa.')
    req('feria', 'Dinos en qué feria vas a estar.')
    const email = String(fd.get('email') || '').trim()
    if (!email) e.email = 'Necesitamos un email para responderte.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Revisa el email, parece incompleto.'
    const tel = String(fd.get('telefono') || '').trim()
    if (tel && !/^[+\d][\d\s().-]{6,}$/.test(tel)) e.telefono = 'Revisa el teléfono.'
    if (!fd.get('privacidad')) e.privacidad = 'Necesitamos tu consentimiento para responderte.'
    return e
  }

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const e = validate(fd)
    setErrors(e)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0]
      ev.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    const lead: Record<string, string> = {}
    fd.forEach((v, k) => {
      lead[k] = lead[k] ? `${lead[k]}, ${v}` : String(v)
    })
    setStatus('sending')
    try {
      await submitLead(lead)
      track('generate_lead', {
        m2: lead.stand_m2 || lead.superficie,
        tipo_stand: lead.stand_tipo,
        feria: lead.feria,
        fecha: lead.fecha,
        superficie: lead.superficie,
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const utm = getUtm()
  const opts = [config.secondFloor && 'segunda planta', config.meeting && 'zona de reunión', config.storage && 'almacén'].filter(Boolean).join(', ')
  const typeLabel = TYPES.find((t) => t.id === config.type)!.label

  if (status === 'sent') {
    return (
      <div ref={doneRef} tabIndex={-1} className={s.done} role="status">
        <span className={s.doneMark} aria-hidden="true" />
        <h2 id={id}>{quote.success}</h2>
        <p>{quote.successText}</p>
        <p className={s.summary}>
          Tu stand: {touched ? `${config.size} m²` : 'superficie por definir'} · {typeLabel.toLowerCase()}
          {opts ? ` · ${opts}` : ''}
        </p>
        <ContactBlock />
      </div>
    )
  }

  const err = (k: string) =>
    errors[k] ? (
      <span className={s.error} id={f(k) + '-err'}>
        {errors[k]}
      </span>
    ) : null
  const aria = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? f(k) + '-err' : undefined })

  return (
    <div>
      <h2 id={id} className={s.title}>
        {quote.title}
      </h2>
      <p className={s.lead}>{quote.text}</p>

      <Configurator onSize={(m) => setArea(areaOption(m))} />

      <form ref={formRef} className={s.form} onSubmit={onSubmit} noValidate>
        <div className={s.grid}>
          <div className={s.field}>
            <label htmlFor={f('nombre')}>Nombre</label>
            <input id={f('nombre')} name="nombre" autoComplete="name" required {...aria('nombre')} />
            {err('nombre')}
          </div>
          <div className={s.field}>
            <label htmlFor={f('empresa')}>Empresa</label>
            <input id={f('empresa')} name="empresa" autoComplete="organization" required {...aria('empresa')} />
            {err('empresa')}
          </div>
          <div className={s.field}>
            <label htmlFor={f('email')}>Email de trabajo</label>
            <input id={f('email')} name="email" type="email" autoComplete="email" inputMode="email" required {...aria('email')} />
            {err('email')}
          </div>
          <div className={s.field}>
            <label htmlFor={f('telefono')}>
              Teléfono <span className={s.optional}>(opcional)</span>
            </label>
            <input id={f('telefono')} name="telefono" type="tel" autoComplete="tel" inputMode="tel" {...aria('telefono')} />
            {err('telefono')}
          </div>
          <div className={s.field}>
            <label htmlFor={f('feria')}>Feria</label>
            <input id={f('feria')} name="feria" placeholder="Ej.: Mobile World Congress" required {...aria('feria')} />
            {err('feria')}
          </div>
          <div className={s.field}>
            <label htmlFor={f('fecha')}>Fecha de la feria</label>
            <input id={f('fecha')} name="fecha" type="date" />
          </div>
          <div className={s.field}>
            <label htmlFor={f('superficie')}>Superficie del stand</label>
            <select id={f('superficie')} name="superficie" value={area} onChange={(e) => setArea(e.target.value)}>
              {quote.areaOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className={s.field}>
            <label htmlFor={f('ciudad')}>Ciudad o país</label>
            <input id={f('ciudad')} name="ciudad" autoComplete="address-level2" />
          </div>
        </div>

        <fieldset className={s.needs}>
          <legend>¿Qué necesitas?</legend>
          {quote.needs.map((n) => (
            <label key={n} className={s.check}>
              <input type="checkbox" name="necesidades" value={n} />
              <span>{n}</span>
            </label>
          ))}
        </fieldset>

        <div className={s.field}>
          <label htmlFor={f('mensaje')}>Algo más que debamos saber</label>
          <textarea id={f('mensaje')} name="mensaje" rows={3} />
        </div>

        <label className={`${s.check} ${s.privacy}`}>
          <input type="checkbox" name="privacidad" value="si" {...aria('privacidad')} />
          <span>Acepto que TCR Area use estos datos para responder a mi solicitud.</span>
        </label>
        {err('privacidad')}

        {/* configuración del stand y origen de la visita */}
        <input type="hidden" name="stand_m2" value={touched ? String(config.size) : ''} />
        <input type="hidden" name="stand_tipo" value={typeLabel} />
        <input type="hidden" name="stand_color" value={config.color} />
        <input type="hidden" name="stand_opciones" value={opts} />
        {Object.entries(utm).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        <button className={s.submit} type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Pedir presupuesto'}
        </button>
        {status === 'error' && (
          <p className={s.error} role="alert">
            No hemos podido enviar la solicitud. Escríbenos a info@tcrarea.com o llámanos al +34 93 379 51 41.
          </p>
        )}
        <p className={s.small}>Respondemos en 48 horas laborables. Sin compromiso.</p>
      </form>
      <ContactBlock />
    </div>
  )
}

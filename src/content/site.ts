// Contenido de la web. Todos los textos, cifras, proyectos y datos de contacto viven aquí.
// Para cambiar un texto, edítalo en este archivo; la escena 3D y el HTML se actualizan solos.

export type HotspotId = 'about' | 'services' | 'projects' | 'process' | 'clients' | 'quote'

export const brand = {
  name: 'TCR Area',
  claim: 'Diseñamos, construimos y montamos stands para ferias en Barcelona y en todo el mundo.',
  manifesto:
    'Durante tres días, un stand es la sede de toda una empresa. Lo diseñamos, lo fabricamos y lo montamos para que nadie pase de largo.',
  origin: "Arquitectura efímera desde L'Hospitalet de Llobregat para 15 países.",
}

export const chapters = {
  plano: { title: 'Antes de la feria, solo hay una línea en el suelo.', standLabel: 'Stand B214', standArea: '160 m²' },
  montaje: { title: 'Lo diseñamos, lo fabricamos y lo montamos.', counterLabel: 'Montaje' },
  luces: { title: 'Después, hay un stand donde todos quieren entrar.' },
  final: {
    title: '¿Cuál es tu próxima feria?',
    text: 'Cuéntanos dónde y cuándo. Te respondemos con una primera idea y un rango de presupuesto en 48 horas laborables.',
  },
}

// ⚠️ CONFIRMAR CON EL CLIENTE: estas cifras vienen de la web actual (redactada en 2016).
// Antes de publicar hay que actualizarlas (años de experiencia, ferias y metros).
export const stats = [
  { value: '789', label: 'ferias internacionales con nuestro trabajo' },
  { value: '15', label: 'países en los que hemos montado' },
  { value: '20.000', label: 'metros cuadrados de stand construidos' },
  { value: '15+', label: 'años en el sector ferial' },
]

export const services = {
  title: 'Un solo equipo, de la primera idea al último tornillo.',
  intro: 'Diseño, construcción y gestión de la feria bajo el mismo techo. Menos intermediarios, menos sorpresas el día del montaje.',
  items: [
    {
      n: '01',
      title: 'Diseño de stands',
      text: 'Estudiamos el espacio, la ubicación en el pabellón, la luz y lo que vendes. Con eso proponemos un stand que comunica un mensaje claro y deja huella en quien lo visita, desde lo más atrevido hasta lo clásico y sofisticado.',
      tags: ['Diseño 3D', 'Diseño gráfico', 'Iluminación'],
    },
    {
      n: '02',
      title: 'Construcción y montaje',
      text: 'Ingenieros, electricistas y carpinteros propios. Tenemos en cuenta columnas, alturas, accesos y normativa de emergencia para definir el flujo de visitantes y montar en tiempo récord.',
      tags: ['Modular', 'Portátil y reutilizable', 'A medida', 'De diseño'],
    },
    {
      n: '03',
      title: 'Gestión de la feria',
      text: 'Llave en mano: ubicación, distribución del espacio, trato con organizadores e instituciones, programación, catering y personal de apoyo. Desde un evento local hasta un congreso internacional.',
      tags: ['Llave en mano', 'Catering y azafatas', 'Coordinación con el recinto'],
    },
  ],
}

export const process = {
  title: 'Así llega tu stand a la feria.',
  intro: 'Un solo interlocutor durante todo el proyecto. Tú decides; nosotros resolvemos.',
  steps: [
    { n: '01', title: 'Briefing', text: 'Objetivos, feria, metros y presupuesto.' },
    { n: '02', title: 'Diseño y render', text: 'Propuesta 3D con distribución y gráfica.' },
    { n: '03', title: 'Fabricación', text: 'Producción en taller y pruebas de luz.' },
    { n: '04', title: 'Montaje', text: 'Equipo propio en el recinto, en plazo.' },
    { n: '05', title: 'Feria', text: 'Soporte técnico mientras dura el evento.' },
    { n: '06', title: 'Desmontaje', text: 'Retirada y almacenaje para reutilizar.' },
  ],
}

export const about = {
  title: 'Durante tres días, un stand es la sede de toda una empresa.',
  text: 'Lo diseñamos, lo fabricamos y lo montamos para que nadie pase de largo. Arquitectura efímera desde L\'Hospitalet de Llobregat para 15 países.',
  statsTitle: 'El oficio, en metros y kilómetros.',
  statsText: 'Cada número es un montaje que llegó a tiempo a la inauguración.',
}

export const clients = {
  title: 'La definición de profesionalidad y experiencia.',
  testimonials: [
    {
      quote: 'La definición de profesionalidad y experiencia. Socios de confianza para proyectos nacionales e internacionales.',
      author: 'Fátima Márquez',
    },
    {
      quote: 'Llevo años trabajando con TCR Area en proyectos dentro y fuera de España y siempre superan las expectativas.',
      author: 'Maite Vila',
    },
  ],
  brands: ['Camper', 'Accenture', 'Iberdrola', 'Abbott', 'Agbar', 'Colgate', 'Hyundai', 'Volkswagen', 'Oakley', 'Mövenpick', 'Veeva', 'Fairline'],
}

export type ProjectCategory = 'Diseño' | 'Construcción' | 'Gestión de feria'
export type Project = { file: string; name: string; category: ProjectCategory; year: string }

// El orden importa: los tres primeros aparecen en las pantallas del stand. Hyundai es la imagen principal.
export const projects: Project[] = [
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-212', name: 'Hyundai', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-tcrarea-barcelona-1', name: 'Accenture', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-20-', name: 'Camper', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-246', name: 'Mövenpick', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-201', name: 'Fairline', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-220', name: 'Iberdrola', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-254', name: 'Oakley', category: 'Diseño', year: '2011–2013' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-608', name: 'Volkswagen', category: 'Construcción', year: '2014' },
  { file: 'diseno-de-stands-para-ferias-barcelona-tcrarea-607', name: 'Veeva', category: 'Construcción', year: '2014' },
  { file: 'montaje-de-stands-para-ferias-barcelona-tcrarea-703', name: 'Canopack', category: 'Construcción', year: '2015' },
  { file: 'montaje-de-stands-para-ferias-barcelona-tcrarea-1026', name: 'Wessco', category: 'Diseño', year: '2015' },
  { file: 'montaje-de-stands-para-ferias-barcelona-tcrarea-1000', name: 'Floratech', category: 'Gestión de feria', year: '2015' },
  { file: 'montaje-de-stands-para-ferias-barcelona-tcrarea-1001', name: 'Sigma', category: 'Gestión de feria', year: '2015' },
  { file: '2016-09-19-TCR-en-CSIO-Barcelona-2', name: 'CSIO Barcelona', category: 'Gestión de feria', year: '2016' },
  { file: '2019-TCR-area-montaje-de-stands-para-ferias-1', name: 'CSIO Barcelona zona de hospitalidad', category: 'Gestión de feria', year: '2019' },
]

export const photo = (file: string, size: 800 | 1600 = 800) => `/fotos/${size}/${file}.webp`
export const photoSrcSet = (file: string) => `${photo(file, 800)} 800w, ${photo(file, 1600)} 1200w`

export const quote = {
  title: '¿Cuál es tu próxima feria?',
  text: 'Cuéntanos dónde y cuándo. Te respondemos con una primera idea y un rango de presupuesto en 48 horas laborables.',
  areaOptions: ['Aún no lo sé', 'Menos de 20 m²', '20 a 50 m²', '50 a 100 m²', '100 a 200 m²', 'Más de 200 m²'],
  needs: ['Diseño', 'Construcción y montaje', 'Gestión de la feria'],
  success: 'Solicitud enviada',
  successText: 'Gracias. Te escribimos en menos de 48 horas laborables con una primera idea y un rango de presupuesto.',
}

export const contact = {
  address: ['Ciudad de la Justicia, Ed. D', 'Avda. Carrilet, 3', "08902 L'Hospitalet de Llobregat, Barcelona"],
  phone: '+34 93 379 51 41',
  phoneHref: 'tel:+34933795141',
  email: 'info@tcrarea.com',
  linkedin: 'https://www.linkedin.com/company/tcr-area-sl',
}

// Hotspots: cada elemento del stand es una sección de la web.
export const hotspots: { id: HotspotId; label: string; element: string }[] = [
  { id: 'about', label: 'Quiénes somos', element: 'Lightbox elevado' },
  { id: 'services', label: 'Servicios', element: 'Pared gráfica' },
  { id: 'projects', label: 'Proyectos', element: 'Pantallas de vídeo' },
  { id: 'process', label: 'Proceso', element: 'Zona de reunión' },
  { id: 'clients', label: 'Clientes', element: 'Tótem de testimonios' },
  { id: 'quote', label: 'Presupuesto', element: 'Mostrador de recepción' },
]

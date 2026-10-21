# Prompt para Claude Code: web 3D interactiva de TCR Area

> Cómo usarlo: descomprime este paquete, abre la carpeta en la terminal, ejecuta `claude` y pega todo lo que está debajo de la línea. Las fotos reales ya están en `assets/fotos/` y la propuesta anterior en `referencia/` como fuente de textos.

---

Eres un desarrollador creativo senior especializado en WebGL, Three.js y experiencias web cinematográficas (nivel Awwwards). Vas a construir desde cero, en esta carpeta, una web interactiva en 3D para **TCR Area**, empresa de Barcelona que diseña, construye y monta stands para ferias internacionales. Es una propuesta de rediseño para presentar al cliente, así que debe impresionar en los primeros 5 segundos y, al mismo tiempo, generar solicitudes de presupuesto.

## 1. Concepto: "Entra en el stand"

Toda la web ocurre dentro de un pabellón ferial de noche. El visitante no navega por páginas: recorre un stand en 3D que se construye delante de él. La navegación principal ocurre dentro de la escena, como en un estudio de experiencias interactivas, y no en un menú tradicional.

Recorrido narrativo controlado por scroll (con la cámara siguiendo una curva `CatmullRomCurve3`):

1. **Plano (0–15 %)**: vista cenital del pabellón a oscuras. Una retícula azul de plano técnico se dibuja sola, aparecen los contornos de los stands vecinos y un rectángulo con cinta amarilla de balizamiento marca el stand `B214, 160 m²`. Titular: "Antes de la feria, solo hay una línea en el suelo."
2. **Montaje (15–45 %)**: la cámara baja en picado mientras el stand se construye pieza a pieza, sincronizado con el scroll: tarima, moqueta, paredes que suben desde el suelo, estructura de truss de aluminio que se ensambla, mostrador, pantallas, plantas, y por último el lightbox elevado con el nombre "TCR AREA". Cada pieza entra con un easing con peso (como si tuviera masa) y un pequeño rebote al encajar. Un contador en una esquina marca "Montaje: 00 h → 72 h".
3. **Luces (45–55 %)**: se encienden los focos del truss uno a uno con un sonido opcional (desactivado por defecto), el lightbox se ilumina y aparece un bloom suave. Titular: "Después, hay un stand donde todos quieren entrar."
4. **Dentro del stand (55–100 %)**: la cámara entra y se detiene en puntos de interés. Cada elemento del stand es una sección de la web (ver punto 3).
5. **Final**: la cámara sale por el pasillo y el mostrador queda en primer plano con el formulario de presupuesto.

Al terminar el recorrido aparece un botón "Explorar libremente" que activa `OrbitControls` con límites (no atraviesa el suelo ni sale del pabellón) y hotspots clicables.

## 2. Stack técnico

- Vite + React + TypeScript.
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`.
- GSAP + ScrollTrigger para la línea de tiempo del scroll. Lenis para scroll suave.
- Zustand para el estado (capítulo actual, hotspot activo, modo libre, calidad gráfica).
- CSS Modules o CSS plano con variables. Nada de Tailwind ni librerías de componentes.
- Sin modelos externos obligatorios: construye el stand de forma procedural con geometrías (`BoxGeometry`, `ExtrudeGeometry`, `CylinderGeometry` para el truss, `RoundedBox` de drei). Deja preparada una ruta para sustituirlo por un `.glb` real del cliente más adelante (`/public/models/stand.glb`, cargado con `useGLTF` si existe).
- Iluminación: `RectAreaLight` para el lightbox, `SpotLight` en el truss con sombras solo en los 2 focos principales, `Environment` de drei con preset nocturno, niebla ligera de pabellón.
- Postprocesado: Bloom selectivo, viñeta y un grano muy sutil. Desactivado en calidad baja.

## 3. Navegación dentro del stand (hotspots)

Cada hotspot es un marcador 3D (aro amarillo pulsante + etiqueta HTML con `<Html>` de drei) y también un enlace en el DOM accesible con teclado. Al pulsarlo, la cámara vuela al punto con GSAP (1,2 s, `power3.inOut`) y se abre un panel HTML lateral con el contenido. `Esc` o "Volver al stand" devuelve la cámara.

| Elemento del stand | Sección | Contenido |
|---|---|---|
| Lightbox elevado | Quiénes somos | Manifiesto y cifras |
| Pared gráfica izquierda | Servicios | Diseño, Construcción y montaje, Gestión de feria |
| Pantallas de vídeo | Proyectos | Galería con las fotos reales |
| Zona de reunión (mesa alta y taburetes) | Proceso | 6 pasos |
| Tótem con testimonios | Clientes | Testimonios y marcas |
| Mostrador de recepción | Presupuesto | Formulario |

**Proyectos en las pantallas**: las fotos de `assets/fotos/` se cargan como texturas en las pantallas del stand. Al hacer hover cambian de blanco y negro a color con un shader (uniform `uSaturation` animado). Al hacer clic se abre el proyecto a pantalla completa con una transición de tipo "la pantalla se expande hasta llenar la vista".

## 4. Extra que vende: configurador de stand

Dentro del panel de presupuesto, un mini configurador que modifica el stand en tiempo real:

- Superficie: 20, 50, 100 o 200 m² (el suelo y las paredes se escalan con transición).
- Tipo: Modular, A medida, De diseño (cambia materiales y presencia del truss).
- Color de marca: selector de color que se aplica a paredes y lightbox.
- Opciones: segunda planta, zona de reunión, almacén.

Lo elegido se envía junto con el formulario como campos ocultos. Es el gancho comercial: el visitante "diseña" su stand y deja sus datos para recibir el presupuesto.

## 5. Contenido real (usar tal cual, en español)

Toma todos los textos de `referencia/tcr-area-propuesta-cinematografica.html`. Resumen:

- **Servicios**: Diseño de stands (espacio, ubicación, luz, mensaje; de lo atrevido a lo clásico); Construcción y montaje (ingenieros, electricistas y carpinteros propios; columnas, alturas, accesos y normativa; tipos: modular, portátil y reutilizable, a medida, de diseño); Gestión de la feria (llave en mano: ubicación, distribución, organizadores e instituciones, programación, catering y personal).
- **Cifras**: 789 ferias internacionales, 15 países, 20.000 m² construidos, 15+ años. Déjalas en un único archivo `src/content/site.ts` con un comentario indicando que hay que confirmarlas con el cliente.
- **Testimonios**: Fátima Márquez y Maite Vila (textos en la referencia).
- **Marcas**: Camper, Accenture, Iberdrola, Abbott, Agbar, Colgate, Hyundai, Volkswagen, Oakley, Mövenpick, Veeva, Fairline. Solo como texto, sin logos.
- **Proyectos** (archivo → nombre, categoría, año):
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-212.jpg` → Hyundai, Diseño, 2011–2013 (imagen principal del hero final)
  - `diseno-de-stands-para-ferias-tcrarea-barcelona-1.jpg` → Accenture, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-20-.jpg` → Camper, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-246.jpg` → Mövenpick, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-201.jpg` → Fairline, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-220.jpg` → Iberdrola, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-254.jpg` → Oakley, Diseño, 2011–2013
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-608.jpg` → Volkswagen, Construcción, 2014
  - `diseno-de-stands-para-ferias-barcelona-tcrarea-607.jpg` → Veeva, Construcción, 2014
  - `montaje-de-stands-para-ferias-barcelona-tcrarea-703.jpg` → Canopack, Construcción, 2015
  - `montaje-de-stands-para-ferias-barcelona-tcrarea-1026.jpg` → Wessco, Diseño, 2015
  - `montaje-de-stands-para-ferias-barcelona-tcrarea-1000.jpg` → Floratech, Gestión de feria, 2015
  - `montaje-de-stands-para-ferias-barcelona-tcrarea-1001.jpg` → Sigma, Gestión de feria, 2015
  - `2016-09-19-TCR-en-CSIO-Barcelona-2.jpg` → CSIO Barcelona, Gestión de feria, 2016
  - `2019-TCR-area-montaje-de-stands-para-ferias-1.jpg` → CSIO Barcelona zona de hospitalidad, Gestión de feria, 2019
- **Contacto**: Ciudad de la Justicia, Ed. D, Avda. Carrilet, 3, 08902 L'Hospitalet de Llobregat, Barcelona. +34 93 379 51 41. info@tcrarea.com. LinkedIn: https://www.linkedin.com/company/tcr-area-sl

Copia las fotos de `assets/fotos/` a `public/fotos/` y genera versiones `.webp` (1600 px y 800 px) con un script `npm run images` usando `sharp`.

## 6. Dirección de arte

- Paleta: pabellón `#1E2833`, tinta `#18212C`, papel `#F2F3F1`, aluminio `#D7DADB`, cinta de balizamiento `#F4C20D`, línea de plano `#6F8FE6`. El amarillo se usa solo para lo que el visitante puede tocar o para la cinta.
- Tipografía: Archivo (Google Fonts, variable con eje `wdth`). Titulares en ancho 125 y peso 800; cifras en ancho 62 (condensado, como la señalética de feria); cuerpo en ancho 100. Newsreader en cursiva solo para testimonios.
- Nada de etiquetas en mayúsculas sobre cada título, nada de flechas "→" en botones, textos en minúscula de frase.
- Movimiento: un solo gran momento orquestado (el montaje del stand). El resto, sobrio. La cámara nunca se mueve sin que el usuario haga scroll o clic, salvo un leve "respirar" en reposo.
- Cursor personalizado en escritorio: un punto que se convierte en aro amarillo sobre los hotspots.
- Loader real: progreso de carga de texturas mostrado como la cinta de balizamiento que se llena; texto "Montando el stand… 64 %".

## 7. Rendimiento y accesibilidad (obligatorio)

- Objetivo: 60 fps en un portátil medio, Lighthouse ≥ 85 en rendimiento en escritorio y ≥ 70 en móvil, LCP < 2,5 s.
- `dpr={[1, 1.75]}`, `PerformanceMonitor` de drei para bajar la calidad automáticamente (sin sombras, sin postprocesado, menos luces).
- Texturas comprimidas (webp; KTX2 si hay tiempo) y carga diferida de las fotos del portafolio.
- **Móvil**: misma narrativa con escena simplificada (sin sombras ni bloom, menos piezas), cámara más abierta y paneles a pantalla completa. Si el dispositivo es muy lento, cae a una versión 2D con vídeo/fotos.
- `prefers-reduced-motion`: sin vuelos de cámara, transiciones por fundido, stand ya montado.
- Todo el contenido existe también en HTML semántico (para SEO y lectores de pantalla), aunque visualmente se presente sobre el 3D. Cada hotspot es un `<button>` con nombre accesible, foco visible y navegación con Tab.
- Metadatos SEO, Open Graph con una captura del stand iluminado y `lang="es"`.

## 8. Medición (soy trafficker, esto es clave)

Crea `src/lib/track.ts` con una función `track(evento, datos)` que empuja a `window.dataLayer` (para GTM) y deja comentados los equivalentes de Meta Pixel. Eventos:

- `chapter_view` (plano, montaje, luces, interior, final)
- `hotspot_click` (nombre del hotspot)
- `project_open` (nombre del proyecto)
- `configurator_change` (opción y valor)
- `generate_lead` al enviar el formulario, con m², tipo de stand, feria y fecha
- Captura los parámetros UTM de la URL y envíalos como campos ocultos del formulario.

El formulario no envía a ningún servidor todavía: valida, muestra confirmación "Solicitud enviada" y deja una función `submitLead()` preparada para conectar con un webhook (n8n, GoHighLevel o Clientify) mediante `VITE_LEAD_WEBHOOK_URL` en `.env`.

## 9. Forma de trabajar

1. Antes de escribir código, muéstrame un plan breve: estructura de carpetas, componentes de la escena, la curva de cámara con sus puntos y la línea de tiempo del scroll por porcentajes. Espera mi visto bueno.
2. Construye por fases y haz un commit al terminar cada una:
   - Fase 1: proyecto base, pabellón, stand procedural estático, luces y cámara.
   - Fase 2: línea de tiempo del scroll (plano → montaje → luces → interior).
   - Fase 3: hotspots, paneles HTML y vuelos de cámara.
   - Fase 4: portafolio en pantallas con shader B/N a color.
   - Fase 5: configurador y formulario con medición.
   - Fase 6: móvil, movimiento reducido, rendimiento y SEO.
3. Al final de cada fase, arranca `npm run dev`, abre la web con Playwright, toma capturas en 1440×900 y 390×844 en varios puntos del scroll, revísalas y corrige lo que veas mal antes de seguir.
4. Deja el servidor de desarrollo corriendo al terminar y dime la URL local.
5. Escribe un `README.md` en español con: cómo arrancarlo, cómo cambiar textos y fotos, cómo sustituir el stand por un `.glb` real y cómo desplegarlo en Vercel o Netlify.

Criterio de éxito: alguien del equipo de TCR Area abre el enlace, hace scroll diez segundos, ve su stand construirse e iluminarse y quiere enseñárselo a su director. Y la persona que entra desde un anuncio encuentra el formulario en menos de dos clics.

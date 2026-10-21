# TCR Area · Entra en el stand

Propuesta de rediseño web en 3D para **TCR Area** (diseño, construcción y montaje de stands para ferias, Barcelona).
Toda la web ocurre dentro de un pabellón ferial de noche: con el scroll, el visitante ve cómo un plano se convierte en el stand B214, cómo se monta pieza a pieza, cómo se encienden las luces y, por último, entra en él. Cada elemento del stand es una sección de la web, y el mostrador lleva al formulario de presupuesto con un configurador de stand en tiempo real.

Stack: Vite, React, TypeScript, three.js, React Three Fiber, drei, postprocessing, GSAP con ScrollTrigger, Lenis y Zustand. CSS Modules sin frameworks.

## Cómo arrancarlo

Necesitas Node 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Compila a `dist/` e inyecta el contenido en HTML para SEO (prerender) |
| `npm run preview` | Sirve la versión compilada |
| `npm run images` | Regenera las fotos `.webp` (800 px y 1600 px) a partir de `public/fotos/*.jpg` |
| `npm run typecheck` | Comprueba los tipos |

Trucos para revisar la web:

- `?p=0.5` abre la web en un punto concreto del recorrido (de 0 a 1). Por ejemplo, `?p=0.75` va a las pantallas de proyectos y `?p=1` al final.
- `?2d` fuerza la versión 2D (la que ven los dispositivos sin WebGL o muy lentos).

## Estructura

```
src/
  content/site.ts        ← TODOS los textos, cifras, proyectos, testimonios, marcas y contacto
  scroll/timeline.ts     ← capítulos, ventanas de montaje de cada pieza y curva de cámara
  scene/                 ← escena 3D (pabellón, retícula de plano, luces, cámara, hotspots, efectos)
  scene/stand/           ← stand procedural (tarima, paredes, truss, mostrador, pantallas, lightbox…)
  ui/                    ← interfaz HTML (titulares, paneles, configurador, formulario, visor, loader)
  lib/track.ts           ← medición (dataLayer / GTM, Meta Pixel comentado)
  lib/submitLead.ts      ← envío del formulario al webhook
  lib/utm.ts             ← captura de UTM, gclid y fbclid
```

## Cambiar textos y fotos

- **Textos y cifras**: edita `src/content/site.ts`. Las cifras (789 ferias, 15 países, 20.000 m², 15+ años) vienen de la web actual y llevan un aviso: **hay que confirmarlas con el cliente antes de publicar**.
- **Proyectos**: en el mismo archivo, la lista `projects` (archivo, nombre, categoría y año). Las tres primeras fotos salen en las pantallas del stand.
- **Fotos nuevas**: copia el `.jpg` a `public/fotos/`, ejecuta `npm run images` y añade la entrada en `projects` con el nombre del archivo sin extensión.
- **Colores y tipografía**: `src/styles/tokens.css` (web) y `src/scene/stand/materials.ts` (3D).
- **Recorrido y cámara**: `src/scroll/timeline.ts`. `CAMERA_KEYS` son las paradas de la cámara (posición y punto de mira) y `T` son las ventanas de scroll en las que entra cada pieza.

## Sustituir el stand procedural por un modelo real (.glb)

1. Exporta el stand del cliente a glTF binario (`.glb`) desde 3ds Max, Rhino, SketchUp o Blender, en **metros** y con el suelo en `y = 0`. El frente debe mirar hacia `+Z` y el centro debe quedar en el origen. El stand de referencia mide 16 × 10 m.
2. Optimízalo (recomendado): `npx @gltf-transform/cli optimize stand.glb stand.glb --texture-compress webp`.
3. Guárdalo como `public/models/stand.glb`.

La escena lo detecta sola (`src/scene/stand/Stand.tsx`), lo carga con `useGLTF` y mantiene los focos, las luces, los hotspots y el recorrido. Si los hotspots no coinciden con el modelo, ajusta `HOTSPOT_VIEWS` en `src/scroll/timeline.ts`. La animación de montaje pieza a pieza es propia del stand procedural; con un `.glb` el stand aparece ya montado.

## Formulario, medición y CRM

- Copia `.env.example` a `.env` y rellena:
  - `VITE_LEAD_WEBHOOK_URL`: webhook de n8n, GoHighLevel o Clientify. El formulario envía un `POST` con JSON. Sin esta variable, el envío se simula y se muestra «Solicitud enviada».
  - `VITE_GTM_ID`: si lo rellenas, la web carga Google Tag Manager.
- Junto con el formulario se envían campos ocultos: la configuración del stand (`stand_m2`, `stand_tipo`, `stand_color` y `stand_opciones`), `utm_*`, `gclid`, `fbclid`, `msclkid`, `li_fat_id`, `landing_page` y `referrer`.
- Eventos en `window.dataLayer` (crea en GTM un activador de evento personalizado por cada uno):

| Evento | Datos |
|---|---|
| `chapter_view` | `capitulo`: plano, montaje, luces, interior, final |
| `hotspot_click` | `hotspot`, `nombre`, `origen` (scene, nav, overlay, cta) |
| `project_open` | `proyecto`, `categoria`, `origen` |
| `configurator_change` | `opcion`, `valor` |
| `generate_lead` | `m2`, `tipo_stand`, `feria`, `fecha`, `superficie` |

En `src/lib/track.ts` están comentados los equivalentes de Meta Pixel (`Lead`, `ViewContent` y `trackCustom`), por si el píxel se instala sin GTM.

## Rendimiento y accesibilidad

- El bundle inicial (React, GSAP y Lenis) ronda los 130 KB comprimidos. La escena 3D se carga en diferido detrás del loader.
- `PerformanceMonitor` baja la calidad automáticamente: quita sombras y postprocesado, deja menos focos y simplifica el truss. Si un móvil sigue sin llegar a los fps, la web pasa a la versión 2D.
- En móvil se recorre la misma narrativa con una escena simplificada, una cámara más abierta y paneles a pantalla completa. En el presupuesto, «Ver mi stand» recoge el panel para ver los cambios del configurador.
- Con `prefers-reduced-motion` el stand aparece ya montado y la cámara cambia de plano por fundido, sin vuelos.
- Todo el contenido existe en HTML semántico y se prerenderiza en `dist/index.html`. La navegación por secciones es una lista de `<button>` accesibles con teclado, y «Saltar al contenido» abre una versión de texto completa.
- Pendiente para una siguiente iteración: texturas KTX2 y un vídeo de timelapse de montaje en la versión 2D.

## Despliegue

**Vercel**: importa el repositorio y Vercel detecta Vite (`vercel.json` ya define el build y las cabeceras de caché). Añade las variables de entorno en *Settings → Environment Variables*.

**Netlify**: *Add new site → Import from Git*. `netlify.toml` ya define `npm run build` y la carpeta `dist`. Las variables de entorno van en *Site configuration → Environment variables*.

Antes de publicar en el dominio definitivo, actualiza la URL canónica y la de Open Graph en `index.html`. La imagen `public/og-stand.jpg` es una captura del stand iluminado.

---

Prototipo de presentación, no es la web oficial de TCR Area. Los textos proceden de la propuesta anterior (`docs/PROMPT-CLAUDE-CODE.md`).

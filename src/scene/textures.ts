import * as THREE from 'three'
import { PALETTE } from './stand/materials'

const FONT = 'Archivo, system-ui, sans-serif'

/** Espera a que Archivo esté disponible para dibujar en canvas (con límite de tiempo). */
export const fontsReady = (() => {
  let p: Promise<void> | null = null
  return () => {
    if (!p) {
      p = Promise.race([
        Promise.all([
          document.fonts.load(`800 100px Archivo`),
          document.fonts.load(`600 100px Archivo`),
          document.fonts.load(`italic 400 100px Newsreader`),
        ]).then(() => undefined),
        new Promise<void>((r) => setTimeout(r, 2500)),
      ])
    }
    return p
  }
})()

const make = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return { c, ctx, tex }
}

type Ctx = CanvasRenderingContext2D & { fontStretch?: string; letterSpacing?: string }

const setFont = (ctx: Ctx, weight: number, size: number, stretch: 'expanded' | 'normal' | 'condensed' | 'extra-condensed' = 'normal') => {
  ctx.font = `${weight} ${size}px ${FONT}`
  try {
    ctx.fontStretch = stretch
  } catch {
    /* navegadores sin soporte */
  }
}

/** Cara del lightbox: "TCR AREA" en ancho 125 / peso 800. */
export function lightboxTexture(brand: string) {
  const { c, ctx, tex } = make(2048, 448)
  const draw = () => {
    ctx.fillStyle = PALETTE.paper
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = brand
    setFont(ctx as Ctx, 800, 250, 'expanded')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ;(ctx as Ctx).letterSpacing = '6px'
    ctx.fillText('TCR AREA', c.width / 2, c.height / 2 + 12)
    tex.needsUpdate = true
  }
  draw()
  fontsReady().then(draw)
  return tex
}

/** Frontal del mostrador: marca sobre el color de marca. */
export function counterTexture(brand: string, fg: string) {
  const { c, ctx, tex } = make(1024, 296)
  const draw = () => {
    ctx.fillStyle = brand
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = fg
    setFont(ctx as Ctx, 800, 96, 'expanded')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TCR AREA', c.width / 2, c.height / 2 + 4)
    tex.needsUpdate = true
  }
  draw()
  fontsReady().then(draw)
  return tex
}

/** Pared gráfica de servicios. */
export function wallGraphicTexture(brand: string) {
  const { c, ctx, tex } = make(2048, 1024)
  const draw = () => {
    ctx.fillStyle = PALETTE.paper
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = brand
    ctx.fillRect(0, c.height - 70, c.width, 70)
    setFont(ctx as Ctx, 800, 150, 'expanded')
    ctx.textBaseline = 'alphabetic'
    const lines = ['Diseño.', 'Construcción.', 'Gestión de feria.']
    lines.forEach((l, i) => ctx.fillText(l, 110, 290 + i * 190))
    setFont(ctx as Ctx, 500, 46)
    ctx.globalAlpha = 0.75
    ctx.fillText('Un solo equipo, de la primera idea al último tornillo.', 116, 870)
    ctx.globalAlpha = 1
    tex.needsUpdate = true
  }
  draw()
  fontsReady().then(draw)
  return tex
}

/** Tótem con un testimonio. */
export function totemTexture(brand: string, quote: string, author: string) {
  const { c, ctx, tex } = make(512, 1536)
  const draw = () => {
    ctx.fillStyle = brand
    ctx.fillRect(0, 0, c.width, c.height)
    const fg = PALETTE.paper
    ctx.fillStyle = fg
    ctx.font = `italic 400 54px Newsreader, Georgia, serif`
    const words = quote.split(' ')
    let line = ''
    let y = 260
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > 400) {
        ctx.fillText(line, 56, y)
        line = w
        y += 70
      } else line = test
    }
    ctx.fillText(line, 56, y)
    setFont(ctx as Ctx, 600, 34)
    ctx.fillText(author, 56, y + 110)
    setFont(ctx as Ctx, 800, 44, 'expanded')
    ctx.fillText('Clientes', 56, 1420)
    tex.needsUpdate = true
  }
  draw()
  fontsReady().then(draw)
  return tex
}

/** Cinta de balizamiento: rayas amarillas y tinta en diagonal. */
export function tapeTexture() {
  const { ctx, tex } = make(256, 32)
  ctx.fillStyle = PALETTE.tape
  ctx.fillRect(0, 0, 256, 32)
  ctx.fillStyle = PALETTE.ink
  for (let x = -32; x < 288; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x, 32)
    ctx.lineTo(x + 18, 32)
    ctx.lineTo(x + 50, 0)
    ctx.lineTo(x + 32, 0)
    ctx.fill()
  }
  tex.wrapS = THREE.RepeatWrapping
  tex.needsUpdate = true
  return tex
}

/** Rótulo del suelo: "B214 · 160 m²" en cifras condensadas. */
export function floorLabelTexture(code: string, area: string) {
  const { c, ctx, tex } = make(1024, 512)
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.fillStyle = PALETTE.line
    setFont(ctx as Ctx, 700, 230, 'extra-condensed')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(code, 512, 190)
    setFont(ctx as Ctx, 500, 110, 'extra-condensed')
    ctx.fillText(area, 512, 380)
    tex.needsUpdate = true
  }
  draw()
  fontsReady().then(draw)
  return tex
}

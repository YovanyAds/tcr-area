/** Espera a que Archivo y Newsreader estén disponibles (con límite de tiempo). */
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

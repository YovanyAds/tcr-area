// Inyecta el HTML semántico prerenderizado dentro de #root en dist/index.html.
// React lo sustituye al arrancar; los rastreadores sin JavaScript leen todo el contenido.
import { readFile, writeFile, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('dist-seo/entry-seo.js')).href)
const html = await readFile('dist/index.html', 'utf8')
const out = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
await writeFile('dist/index.html', out)
await rm('dist-seo', { recursive: true, force: true })
console.log('✓ contenido prerenderizado en dist/index.html')

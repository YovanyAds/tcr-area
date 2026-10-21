// Genera versiones .webp (1600 px y 800 px) de las fotos de public/fotos/
// Uso: npm run images
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'

const SRC = 'public/fotos'
const SIZES = [1600, 800]

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))
for (const size of SIZES) await mkdir(join(SRC, String(size)), { recursive: true })

for (const file of files) {
  const { name } = parse(file)
  for (const size of SIZES) {
    const out = join(SRC, String(size), `${name}.webp`)
    await sharp(join(SRC, file))
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: size > 1000 ? 78 : 72 })
      .toFile(out)
  }
  console.log('✓', name)
}
console.log(`${files.length} fotos × ${SIZES.length} tamaños`)

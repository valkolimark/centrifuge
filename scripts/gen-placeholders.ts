// Generates neutral placeholder images used by /styleguide demos and the Cycle 1
// home hero, so next/image renders real, correctly-sized assets (no broken images
// in Lighthouse). Real shop photography replaces these from Cycle 2's asset migration.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/placeholders')
mkdirSync(outDir, { recursive: true })

function svg(w: number, h: number, from: string, to: string, label: string): Buffer {
  const r1 = Math.min(w, h) * 0.32
  const r2 = Math.min(w, h) * 0.2
  const fs = Math.round(h * 0.06)
  const s =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<g fill="#ffffff" fill-opacity="0.12">` +
    `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${r1}"/>` +
    `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${r2}" fill="#0b3a6b"/></g>` +
    `<text x="24" y="${h - 24}" font-family="Arial, sans-serif" font-size="${fs}" ` +
    `fill="#ffffff" fill-opacity="0.7">${label}</text></svg>`
  return Buffer.from(s)
}

const assets: Array<[string, number, number, string, string, string]> = [
  ['shop-hero.jpg', 1600, 900, '#072546', '#0b3a6b', 'Placeholder — shop floor'],
  ['before.jpg', 1200, 800, '#2e3a45', '#6b7a89', 'Placeholder — before'],
  ['after.jpg', 1200, 800, '#0b3a6b', '#1e6fd9', 'Placeholder — after'],
  ['gallery-1.jpg', 800, 600, '#0b3a6b', '#2e3a45', 'Placeholder 1'],
  ['gallery-2.jpg', 800, 600, '#1e6fd9', '#072546', 'Placeholder 2'],
  ['gallery-3.jpg', 800, 600, '#2e3a45', '#0b3a6b', 'Placeholder 3'],
]

async function main() {
  for (const [name, w, h, from, to, label] of assets) {
    await sharp(svg(w, h, from, to, label)).jpeg({ quality: 72 }).toFile(resolve(outDir, name))
    console.log('wrote', name)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

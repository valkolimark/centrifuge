// Compiles data/redirects.csv + generated OEM brand redirects into
// src/lib/redirects-data.json, consumed by middleware.ts. In later cycles the
// Payload `redirects` collection becomes the editable source and re-emits this file.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

interface Redirect {
  from: string
  to: string
  note?: string
}

function parseCsv(csv: string): Redirect[] {
  const out: Redirect[] = []
  for (const raw of csv.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || line.startsWith('legacy_url,')) continue
    const [from, to, ...noteParts] = line.split(',')
    if (!from || !to) continue
    out.push({ from: from.trim(), to: to.trim(), note: noteParts.join(',').trim() || undefined })
  }
  return out
}

const csv = readFileSync(resolve(root, 'data/redirects.csv'), 'utf8')
const observed = parseCsv(csv)

// Generate OEM slug redirects from oem-brands.json (Cycle 3 will confirm/extend).
const brandsJson = JSON.parse(readFileSync(resolve(root, 'data/oem-brands.json'), 'utf8')) as {
  brands: Array<{ slug: string; legacy_slugs: string[] }>
}
const oem: Redirect[] = []
for (const b of brandsJson.brands) {
  for (const legacy of b.legacy_slugs) {
    oem.push({ from: legacy, to: `/brands/${b.slug}/`, note: 'oem (generated)' })
  }
}

// Merge, de-dupe by `from` (explicit CSV entries win over generated ones).
const byFrom = new Map<string, Redirect>()
for (const r of oem) byFrom.set(normalize(r.from), r)
for (const r of observed) byFrom.set(normalize(r.from), r)

function normalize(p: string): string {
  let s = p.trim()
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s.toLowerCase()
}

const map: Record<string, string> = {}
for (const [from, r] of byFrom) map[from] = r.to

const outPath = resolve(root, 'src/lib/redirects-data.json')
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n')
console.log(`Wrote ${Object.keys(map).length} redirects → ${outPath}`)

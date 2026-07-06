// Compiles the 301 map into src/lib/redirects-data.json, consumed by middleware.ts.
// Runs in `prebuild` before every build. Source of truth = the Payload `redirects`
// collection (editable in /admin). If the DB is unavailable at build time (or the
// collection is empty), it falls back to data/redirects.csv + generated OEM slugs
// so the build never loses redirects.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

interface Redirect {
  from: string
  to: string
  note?: string
}

function normalize(p: string): string {
  let s = p.trim()
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s.toLowerCase()
}

function loadEnv() {
  const f = resolve(root, '.env.local')
  if (!existsSync(f)) return
  for (const l of readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
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

function fallbackEntries(): Redirect[] {
  const observed = parseCsv(readFileSync(resolve(root, 'data/redirects.csv'), 'utf8'))
  const brandsJson = JSON.parse(readFileSync(resolve(root, 'data/oem-brands.json'), 'utf8')) as {
    brands: Array<{ slug: string; legacy_slugs: string[] }>
  }
  const byFrom = new Map<string, Redirect>()
  for (const b of brandsJson.brands) for (const legacy of b.legacy_slugs) byFrom.set(normalize(legacy), { from: legacy, to: `/brands/${b.slug}/`, note: 'oem (generated)' })
  for (const r of observed) byFrom.set(normalize(r.from), r) // CSV overrides generated
  return [...byFrom.values()]
}

async function fromCollection(): Promise<Redirect[] | null> {
  try {
    loadEnv()
    // Read-only step: force production so payload.config disables drizzle `push`. Without this,
    // NODE_ENV defaults to dev here, which both enables push AND (via Users.ts's env-gated auth
    // lockout) expects a schema without login_attempts/lock_until — so push would try to DROP
    // those columns from the shared Neon DB and hang the build on a data-loss prompt.
    if (process.env.NODE_ENV !== 'production') (process.env as Record<string, string>).NODE_ENV = 'production'
    const { default: config } = await import('../src/payload.config.ts')
    const { getPayload } = await import('payload')
    const payload = await getPayload({ config })
    const res = await payload.find({ collection: 'redirects', limit: 2000, depth: 0 })
    if (!res.docs.length) return null
    return (res.docs as Array<{ from: string; to: string; note?: string }>).map((d) => ({ from: d.from, to: d.to, note: d.note }))
  } catch (e) {
    console.warn(`[build-redirects] CMS collection unavailable, using CSV+OEM fallback (${(e as Error).message})`)
    return null
  }
}

async function main() {
  const collection = await fromCollection()
  const entries = collection ?? fallbackEntries()
  console.log(`[build-redirects] source: ${collection ? 'CMS collection' : 'CSV + OEM fallback'} (${entries.length} entries)`)

  const byFrom = new Map<string, Redirect>()
  for (const r of entries) if (r.from && r.to) byFrom.set(normalize(r.from), r)

  const map: Record<string, string> = {}
  for (const [from, r] of byFrom) if (normalize(r.to) !== from) map[from] = r.to

  const outPath = resolve(root, 'src/lib/redirects-data.json')
  writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n')
  console.log(`Wrote ${Object.keys(map).length} redirects → ${outPath}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

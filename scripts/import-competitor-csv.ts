// Imports competitor SEO data into the competitor-snapshots collection.
//   pnpm tsx scripts/import-competitor-csv.ts <file.csv>   # import an export
//   pnpm tsx scripts/import-competitor-csv.ts --seed       # seed example data
//
// CSV columns (Ahrefs/Semrush export, re-shaped): label,domain,visibility,
// topKeywords,estTraffic,delta,capturedAt  (one row per competitor).
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
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

type Snap = {
  label: string; domain: string; visibility?: number; topKeywords?: number
  estTraffic?: number; delta?: number; capturedAt: string; isExample?: boolean
  keywords?: { query: string; ourRank?: number; theirBest?: number; movement?: number }[]
}

function parseCsv(text: string, capturedAt: string): Snap[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const header = lines.shift()?.toLowerCase().split(',').map((h) => h.trim()) ?? []
  const idx = (k: string) => header.indexOf(k)
  return lines.map((line) => {
    const c = line.split(',').map((x) => x.trim())
    const num = (k: string) => { const i = idx(k); const n = i >= 0 ? Number(c[i]) : NaN; return Number.isFinite(n) ? n : undefined }
    return {
      label: c[idx('label')] || c[0],
      domain: c[idx('domain')] || c[1] || '',
      visibility: num('visibility'), topKeywords: num('topkeywords'),
      estTraffic: num('esttraffic'), delta: num('delta'),
      capturedAt: c[idx('capturedat')] || capturedAt,
    }
  })
}

// Example data (clearly labeled isExample) so the radar renders before real import.
function exampleSnaps(capturedAt: string): Snap[] {
  return [
    { label: 'Example Competitor A', domain: 'example-competitor-a.com', visibility: 62, topKeywords: 140, estTraffic: 5400, delta: -3, capturedAt, isExample: true,
      keywords: [ { query: 'decanter centrifuge repair', ourRank: 3, theirBest: 5, movement: 2 }, { query: 'used centrifuges for sale', ourRank: 6, theirBest: 2, movement: -1 } ] },
    { label: 'Example Competitor B', domain: 'example-competitor-b.com', visibility: 48, topKeywords: 90, estTraffic: 3100, delta: 1, capturedAt, isExample: true,
      keywords: [ { query: 'basket centrifuge repair', ourRank: 2, theirBest: 4, movement: 1 } ] },
    { label: 'Centrifuge World (you)', domain: 'centrifuge.com', visibility: 71, topKeywords: 165, estTraffic: 6200, delta: 6, capturedAt, isExample: true, keywords: [] },
  ]
}

async function main() {
  loadEnv()
  const arg = process.argv[2]
  const capturedAt = process.env.CAPTURED_AT || '2026-07-04T00:00:00.000Z'
  let snaps: Snap[]
  if (arg === '--seed') snaps = exampleSnaps(capturedAt)
  else if (arg && existsSync(arg)) snaps = parseCsv(readFileSync(arg, 'utf8'), capturedAt)
  else { console.error('Usage: import-competitor-csv.ts <file.csv> | --seed'); process.exit(1) }

  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  let created = 0, updated = 0
  for (const s of snaps) {
    const data = { ...s }
    const ex = await payload.find({ collection: 'competitor-snapshots', where: { and: [{ domain: { equals: s.domain } }, { capturedAt: { equals: s.capturedAt } }] }, limit: 1 })
    if (ex.docs.length) { await payload.update({ collection: 'competitor-snapshots', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'competitor-snapshots', data }); created++ }
  }
  console.log(`DONE — competitor snapshots created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

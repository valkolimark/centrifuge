// Imports the compiled redirect map (src/lib/redirects-data.json) into the Payload
// `redirects` collection so all 301s are visible/editable in /admin. Idempotent by
// `from`. After this, the collection is the editable source (build-redirects.ts
// reads it; CSV/OEM remain a build-time fallback).
// Run: pnpm tsx scripts/import-redirects.ts
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

// Classify note by destination for readable admin rows.
function noteFor(to: string): string {
  if (to.startsWith('/brands/')) return 'OEM brand / model'
  if (to.startsWith('/services/')) return 'legacy service page'
  if (to.startsWith('/industries/')) return 'legacy industry page'
  if (to.startsWith('/resources/how-it-works/')) return 'legacy how-it-works page'
  if (to.startsWith('/resources/')) return 'legacy resource/category'
  if (to === '/inventory/' || to === '/used-centrifuges/') return 'legacy inventory/sales'
  return 'legacy page'
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const map = JSON.parse(readFileSync(resolve(root, 'src/lib/redirects-data.json'), 'utf8')) as Record<string, string>
  let created = 0, updated = 0
  for (const [from, to] of Object.entries(map)) {
    const data = { from, to, type: '301' as const, note: noteFor(to) }
    const ex = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1 })
    if (ex.docs.length) { await payload.update({ collection: 'redirects', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'redirects', data }); created++ }
  }
  console.log(`DONE — redirects created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

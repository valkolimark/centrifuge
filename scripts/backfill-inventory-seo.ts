// Backfills SEO title/description on inventory items (they were seeded without
// SEO) and removes exact-duplicate listings (same computed title).
// Run: pnpm tsx scripts/backfill-inventory-seo.ts
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
function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  const cut = s.slice(0, n); const sp = cut.lastIndexOf(' ')
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s|,–-]+$/, '').trim()
}
const SUFFIX = ' | Centrifuge World'

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'inventory', depth: 0, limit: 500, draft: true })
  const seen = new Set<string>()
  let updated = 0, deleted = 0
  for (const doc of res.docs as unknown as Array<Record<string, unknown>>) {
    const title = String(doc.title ?? '')
    const head = truncate(title.replace(/\s*\(.*\)\s*$/, '').trim(), 60 - SUFFIX.length)
    const seoTitle = head + SUFFIX
    if (seen.has(seoTitle)) {
      await payload.delete({ collection: 'inventory', id: doc.id as string })
      deleted++
      continue
    }
    seen.add(seoTitle)
    const short = String(doc.shortDescription ?? '').trim()
    const desc = truncate(short || `Used ${title} for sale from Centrifuge World — reconditioned, inspected, and test-run. Request price and availability.`, 155)
    await payload.update({ collection: 'inventory', id: doc.id as string, data: { seo: { title: seoTitle, description: desc } } })
    updated++
  }
  console.log(`DONE — inventory seo updated ${updated}, duplicate listings deleted ${deleted}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

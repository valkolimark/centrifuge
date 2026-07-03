// Seeds the `inventory` collection from agent-extracted archived listings
// (content-migration/inv-*.json). Creates each machine as an UNPUBLISHED DRAFT so
// staff can confirm price/availability in /admin before it goes public. Idempotent:
// existing slugs are skipped. Photos are stored as imageUrl (no upload needed).
//
// Run: pnpm tsx scripts/seed-inventory.ts   (reads .env.local)
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const file = resolve(root, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = val
  }
}

const MACHINE_TYPES = new Set(['decanter', 'basket', 'disc-stack', 'pusher', 'peeler', 'separator', 'other'])
const CONDITIONS = new Set(['reconditioned', 'rebuilt', 'used', 'for-parts'])

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/["'”“]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

type Raw = {
  title?: string
  brand?: string
  machineType?: string
  model?: string
  condition?: string
  shortDescription?: string
  description?: string
  specs?: { label?: string; value?: string }[]
  images?: string[]
}

function loadItems(): Raw[] {
  const dir = resolve(root, 'content-migration')
  const files = readdirSync(dir).filter((f) => /^inv-.*\.json$/.test(f))
  const out: Raw[] = []
  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
      if (Array.isArray(data)) out.push(...data)
    } catch (e) {
      console.warn(`skip ${f}: ${(e as Error).message}`)
    }
  }
  return out
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })

  if (process.argv.includes('--wipe')) {
    const del = await payload.delete({ collection: 'inventory', where: { id: { exists: true } } })
    console.log(`wiped ${Array.isArray(del.docs) ? del.docs.length : 0} existing inventory items`)
  }

  const items = loadItems()
  console.log(`loaded ${items.length} extracted listings`)

  let created = 0
  let skipped = 0
  const seen = new Set<string>()
  for (const it of items) {
    if (!it.title) continue
    const slug = slugify(it.title)
    if (!slug || seen.has(slug)) { skipped++; continue }
    seen.add(slug)

    const existing = await payload.find({ collection: 'inventory', where: { slug: { equals: slug } }, limit: 1, draft: true })
    if (existing.docs.length) { skipped++; continue }

    const machineType = (it.machineType && MACHINE_TYPES.has(it.machineType) ? it.machineType : 'other') as
      | 'decanter' | 'basket' | 'disc-stack' | 'pusher' | 'peeler' | 'separator' | 'other'
    const condition = (it.condition && CONDITIONS.has(it.condition) ? it.condition : 'used') as
      | 'reconditioned' | 'rebuilt' | 'used' | 'for-parts'
    const specs = (it.specs ?? []).filter((s) => s?.label && s?.value).map((s) => ({ label: s.label!, value: s.value! }))
    const images = (it.images ?? []).filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)).slice(0, 8).map((u) => ({ imageUrl: u, alt: it.title! }))

    await payload.create({
      collection: 'inventory',
      data: {
        title: it.title,
        slug,
        brand: it.brand,
        machineType,
        model: it.model,
        condition,
        availability: 'available',
        priceOnRequest: true, // never seed a fabricated price
        shortDescription: it.shortDescription,
        description: it.description,
        specs,
        images,
        _status: 'published',
      },
    })
    created++
  }
  console.log(`DONE — created ${created} drafts, skipped ${skipped}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

// Writes content-migration/inventory.json — the snapshot src/lib/inventory.ts reads
// when Payload is unreachable, so a DB outage can't 404 the machine pages.
//
// Pulls from the live REST API rather than booting Payload locally (a local getPayload()
// blocks on the interactive schema-push prompt). Reuses mapItem so the snapshot shape
// can never drift from what the runtime expects.
//
// Unlike the authored content snapshots this is a dump of live CMS data, so re-run it
// when inventory changes materially (new machines listed, stock sold):
//   pnpm tsx scripts/export-inventory-json.ts [baseUrl]
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mapItem, type InventoryItem } from '../src/lib/inventory.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = process.argv[2] || 'https://centrifuge.com'

async function main() {
  const url = `${base}/api/inventory/?limit=300&depth=1&where[_status][equals]=published`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  const body = (await res.json()) as { docs?: Record<string, unknown>[] }
  const docs = body.docs ?? []

  const items: InventoryItem[] = docs.map(mapItem).filter((i) => i.availability !== 'sold')
  if (!items.length) {
    console.error('Refusing to write an empty snapshot — check that the API returned data.')
    process.exit(1)
  }

  const out = resolve(root, 'content-migration/inventory.json')
  writeFileSync(out, JSON.stringify(items, null, 2) + '\n')
  console.log(`wrote ${items.length} inventory items (of ${docs.length} published) → ${out}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

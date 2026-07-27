// Writes content-migration/services.json — the JSON fallback the /services routes
// read when Payload is unavailable (see src/lib/content.ts). Source of truth is the
// authored SERVICES array in seed-services.ts, so the snapshot and the seed agree.
// Run: pnpm tsx scripts/export-services-json.ts
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERVICES, toDoc } from './seed-services.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'content-migration/services.json')

const docs = SERVICES.map(toDoc)
writeFileSync(out, JSON.stringify(docs, null, 2) + '\n')
console.log(`wrote ${docs.length} services → ${out}`)

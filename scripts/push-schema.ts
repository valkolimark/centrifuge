// Boots Payload once so drizzle pushes the current schema to Neon (creates the
// new `inventory` table). Additive-only, so the push is non-interactive.
// Run: pnpm tsx scripts/push-schema.ts   (reads .env.local)
import { readFileSync, existsSync } from 'node:fs'
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val
  }
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  // Confirm the collection is queryable now that the table exists.
  const res = await payload.count({ collection: 'inventory' })
  console.log(`OK — inventory table ready (count=${res.totalDocs})`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

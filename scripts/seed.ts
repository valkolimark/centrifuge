// Idempotent seed (task 1.2). Boots Payload (which pushes the schema to Neon on
// first run), then creates one user per role and seeds the three globals from the
// authoritative /data files. Re-running is safe: existing records are skipped/updated.
//
// Run: pnpm seed   (reads .env.local)
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Minimal .env.local loader (no dotenv dependency).
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

function readJson(rel: string) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'))
}

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'ChangeMe!Cycle1'

const SEED_USERS = [
  { email: 'superadmin@centrifuge.com', name: 'Super Admin', role: 'super-admin' as const },
  { email: 'editor@centrifuge.com', name: 'Editor', role: 'editor' as const },
  { email: 'content@centrifuge.com', name: 'Content Manager', role: 'content-manager' as const },
  { email: 'viewer@centrifuge.com', name: 'Viewer', role: 'viewer' as const },
]

async function main() {
  loadEnv()
  // Import the config AFTER env is loaded so it reads the Neon connection string
  // (and derives ssl) rather than falling back to PG* vars without TLS.
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })

  // ── Users ───────────────────────────────────────────────────
  for (const u of SEED_USERS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: u.email } },
      limit: 1,
    })
    if (existing.docs.length) {
      payload.logger.info(`user exists: ${u.email} (${u.role})`)
      continue
    }
    await payload.create({
      collection: 'users',
      data: { ...u, password: SEED_PASSWORD },
    })
    payload.logger.info(`created user: ${u.email} (${u.role})`)
  }

  // ── Globals from /data ──────────────────────────────────────
  const nap = readJson('data/nap.json')
  const nav = readJson('data/navigation.json')

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      companyName: nap.organization.name,
      foundingYear: nap.organization.foundingYear,
      publicEmail: nap.organization.public_email,
      trustBar: [
        { value: 'Since 1939', label: 'Trusted expertise' },
        { value: '3 US Facilities', label: 'Houston · Chicago area' },
        { value: '45+ Brands', label: 'OEM equipment serviced' },
        { value: '24/7', label: 'Emergency service' },
      ],
      sameAs: [], // TODO(verify: exact social URLs, Cycle 4)
    },
  })
  payload.logger.info('seeded global: site-settings (from nap.json)')

  await payload.updateGlobal({ slug: 'header-nav', data: { structure: nav } })
  payload.logger.info('seeded global: header-nav (from navigation.json)')

  await payload.updateGlobal({ slug: 'footer', data: { structure: nav.footer } })
  payload.logger.info('seeded global: footer (from navigation.json)')

  payload.logger.info('\nSeed complete. Users share password from SEED_PASSWORD (default: ChangeMe!Cycle1).')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

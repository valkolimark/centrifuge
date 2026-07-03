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

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  for (const c of ['services', 'oem-brands', 'industries', 'locations', 'posts', 'case-studies', 'faqs', 'inventory', 'pages']) {
    try {
      const r = await payload.count({ collection: c as never })
      console.log(`${c}: ${r.totalDocs}`)
    } catch {
      console.log(`${c}: ERR`)
    }
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

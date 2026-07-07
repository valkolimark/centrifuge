/* CYCLE-INV-1 Phase 1: migrate inventory photos off the retired inventory.centrifuge.com
 * (WooCommerce/SiteGround) host into Payload media (Vercel Blob). Downloads each image from
 * the SiteGround origin IP (the DNS host now 308-redirects), uploads to media, and rewrites
 * each inventory doc's images[] from imageUrl → uploaded `image`. Idempotent (skips items that
 * already have an uploaded image). Keeps the original imageUrl if a download fails.
 *
 * Run: pnpm tsx scripts/migrate-inventory-images.ts           (dry — counts + tests 1 download)
 *      pnpm tsx scripts/migrate-inventory-images.ts --write    (migrate for real)
 */
import { readFileSync } from 'node:fs'
import https from 'node:https'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'

const WRITE = process.argv.includes('--write')
const ORIGIN_IP = '34.174.141.60'
const RETIRED_HOST = 'inventory.centrifuge.com'

function download(pathname: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { host: ORIGIN_IP, servername: RETIRED_HOST, path: pathname, headers: { Host: RETIRED_HOST }, rejectUnauthorized: false, timeout: 30000 },
      (res) => {
        if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)) }
        const chunks: Buffer[] = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: String(res.headers['content-type'] || 'image/jpeg').split(';')[0] }))
      },
    )
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

const { getPayloadClient } = await import('@/lib/payload')
const p = await getPayloadClient()

const res = await p.find({ collection: 'inventory', limit: 500, depth: 0, overrideAccess: true })
let migrated = 0, skipped = 0, failed = 0, docsUpdated = 0, testedDownload = false

for (const doc of res.docs as any[]) {
  const images = doc.images || []
  const newImages: any[] = []
  let changed = false
  for (const item of images) {
    if (item.image) { newImages.push(item); skipped++; continue }
    if (!item.imageUrl) { newImages.push(item); continue }
    let pathname = ''
    try { pathname = new URL(item.imageUrl).pathname } catch { newImages.push(item); failed++; continue }
    const name = decodeURIComponent(pathname.split('/').pop() || 'image.jpg')
    const alt = item.alt || `${doc.title} — photo`
    try {
      if (!WRITE) {
        // Dry: verify connectivity once, then just count.
        if (!testedDownload) { const t = await download(pathname); console.log(`  download OK: ${name} (${t.buffer.length} bytes, ${t.contentType})`); testedDownload = true }
        migrated++; changed = true; newImages.push({ image: '(pending)', alt }); continue
      }
      const { buffer, contentType } = await download(pathname)
      const media = await p.create({ collection: 'media', data: { alt }, file: { data: buffer, mimetype: contentType, name, size: buffer.length }, overrideAccess: true })
      newImages.push({ image: media.id, alt })
      migrated++; changed = true
      process.stdout.write('.')
    } catch (e: any) {
      console.warn(`\n  FAIL ${item.imageUrl}: ${e.message}`)
      newImages.push(item) // keep original so nothing is lost
      failed++
    }
  }
  if (changed) {
    docsUpdated++
    if (WRITE) await p.update({ collection: 'inventory', id: doc.id, data: { images: newImages, _status: 'published' }, overrideAccess: true })
  }
}

console.log(`\n${WRITE ? 'MIGRATED' : 'WOULD MIGRATE'} — images: ${migrated} · already-media (skipped): ${skipped} · failed: ${failed} · docs touched: ${docsUpdated}`)
if (!WRITE) console.log('DRY — re-run with --write to migrate.')
process.exit(0)

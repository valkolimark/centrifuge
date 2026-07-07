/* Read-only audit of inventory image sources ahead of the migration (CYCLE-INV-1 Phase 1). */
import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'
const { getPayloadClient } = await import('@/lib/payload')
const p = await getPayloadClient()

const res = await p.find({ collection: 'inventory', limit: 500, depth: 0, overrideAccess: true, draft: true })
let docs = 0, totalImgs = 0, withUpload = 0, withUrl = 0
const hosts: Record<string, number> = {}
for (const d of res.docs as any[]) {
  docs++
  for (const im of d.images || []) {
    totalImgs++
    if (im.image) withUpload++
    if (im.imageUrl) {
      withUrl++
      try { hosts[new URL(im.imageUrl).host] = (hosts[new URL(im.imageUrl).host] || 0) + 1 } catch { hosts['(bad url)'] = (hosts['(bad url)'] || 0) + 1 }
    }
  }
}
console.log(`inventory docs: ${res.totalDocs} (fetched ${docs})`)
console.log(`image rows: ${totalImgs} · with uploaded media: ${withUpload} · with imageUrl: ${withUrl}`)
console.log('imageUrl hosts:', JSON.stringify(hosts, null, 2))
console.log('BLOB_READ_WRITE_TOKEN set:', !!process.env.BLOB_READ_WRITE_TOKEN)
process.exit(0)

import { readFileSync } from 'node:fs'
for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
if (!process.env.NODE_ENV) (process.env as Record<string, string>).NODE_ENV = 'production'
const { getPayloadClient } = await import('@/lib/payload')
const p = await getPayloadClient()
const subs = await p.find({ collection: 'form-submissions', limit: 3, sort: '-createdAt', depth: 0, overrideAccess: true })
for (const s of subs.docs as any[]) {
  console.log('\n--- submission', s.id, '| type', s.type, '| name', s.name, '---')
  console.log('payload:', JSON.stringify(s.payload))
}
const leads = await p.find({ collection: 'leads', where: { sourceForm: { not_equals: 'manual' } }, limit: 2, sort: '-createdAt', depth: 0, overrideAccess: true })
for (const l of leads.docs as any[]) {
  console.log('\n--- lead', l.id, '| name', l.name, '| message:', JSON.stringify(l.message), '---')
  console.log('payload:', JSON.stringify(l.payload))
}
process.exit(0)

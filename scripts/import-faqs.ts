// Imports content-migration/faqs.json into the faqs collection (published).
// Run: pnpm tsx scripts/import-faqs.ts
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
type Faq = { category: string; order?: number; question: string; answer: string }

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const items = JSON.parse(readFileSync(resolve(root, 'content-migration/faqs.json'), 'utf8')) as Faq[]
  let created = 0, updated = 0
  for (const it of items) {
    if (!it.question || !it.answer) continue
    const data = {
      question: it.question,
      answer: it.answer,
      category: it.category as 'repair-rebuilds' | 'emergency-field' | 'parts-fabrication' | 'buying-selling' | 'costs-turnaround',
      order: it.order ?? 0,
      _status: 'published' as const,
    }
    const ex = await payload.find({ collection: 'faqs', where: { question: { equals: it.question } }, limit: 1, draft: true })
    if (ex.docs.length) { await payload.update({ collection: 'faqs', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'faqs', data }); created++ }
  }
  console.log(`DONE — faqs created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

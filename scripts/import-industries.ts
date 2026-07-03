// Imports content-migration/industries.json into the industries collection.
// Run: pnpm tsx scripts/import-industries.ts
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
function stripTodo(s: string) { return s.replace(/\s*TODO\([^)]*\)\.?/g, '').replace(/\s{2,}/g, ' ').trim() }
const clean = (s?: string) => (typeof s === 'string' ? stripTodo(s) : undefined)

type Ind = {
  slug: string; name: string; answerBox?: string; intro?: string
  typicalEquipment?: { text: string; links?: { label: string; href: string }[] }[]
  failureModes?: string[]
  relevantServices?: { label: string; href: string }[]
  relatedBrands?: { label: string; href: string }[]
  faqs?: { question: string; answer: string }[]
  hero?: { src: string; alt?: string }
  seoTitle?: string; seoDescription?: string
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const items = JSON.parse(readFileSync(resolve(root, 'content-migration/industries.json'), 'utf8')) as Ind[]
  let created = 0, updated = 0
  for (const it of items) {
    if (!it.slug || !it.name) continue
    const data = {
      title: it.name,
      slug: it.slug,
      answerBox: clean(it.answerBox),
      intro: clean(it.intro),
      hero: it.hero?.src ? { url: it.hero.src, alt: it.hero.alt || it.name } : undefined,
      typicalEquipment: (it.typicalEquipment ?? []).map((e) => ({ text: stripTodo(e.text), links: e.links ?? [] })),
      failureModes: (it.failureModes ?? []).map((v) => ({ value: stripTodo(v) })),
      relevantServices: it.relevantServices ?? [],
      relatedBrands: it.relatedBrands ?? [],
      faqs: (it.faqs ?? []).filter((q) => q.question && q.answer).map((q) => ({ question: stripTodo(q.question), answer: stripTodo(q.answer) })),
      seo: { title: clean(it.seoTitle), description: clean(it.seoDescription) },
      _status: 'published' as const,
    }
    const ex = await payload.find({ collection: 'industries', where: { slug: { equals: it.slug } }, limit: 1, draft: true })
    if (ex.docs.length) { await payload.update({ collection: 'industries', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'industries', data }); created++ }
  }
  console.log(`DONE — industries created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

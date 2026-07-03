// Imports content-migration/oem/*.json into the oem-brands collection (published),
// so the 42 brand pages are editable in /admin. Idempotent: existing slugs update.
// Run: pnpm tsx scripts/import-brands.ts   (reads .env.local)
import { readFileSync, existsSync, readdirSync } from 'node:fs'
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
function stripTodo(s: string): string {
  return s.replace(/\s*TODO\([^)]*\)\.?/g, '').replace(/\s{2,}/g, ' ').trim()
}
const clean = (s?: string) => (typeof s === 'string' ? stripTodo(s) : undefined)

type Brand = {
  slug: string
  name: string
  answerBox?: string
  intro?: string
  disclosure?: string
  body?: string[]
  modelsServiced?: string[]
  typesServiced?: string[]
  capabilities?: { item: string; detail?: string }[]
  faqs?: { question: string; answer: string }[]
  images?: { src: string; alt?: string }[]
  relatedServices?: { label: string; href: string }[]
  relatedBrands?: { label: string; href: string }[]
  relatedIndustries?: { label: string; href: string }[]
  seoTitle?: string
  seoDescription?: string
  mergeInto?: string | null
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })

  // Featured flags from the authoritative brand list.
  const featured = new Map<string, boolean>()
  try {
    const list = JSON.parse(readFileSync(resolve(root, 'data/oem-brands.json'), 'utf8')) as { slug: string; featured?: boolean }[]
    for (const b of list) featured.set(b.slug, !!b.featured)
  } catch {
    /* optional */
  }

  const dir = resolve(root, 'content-migration/oem')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  let created = 0
  let updated = 0
  for (const f of files) {
    const b = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Brand
    if (!b.slug || !b.name) continue
    const data = {
      name: b.name,
      slug: b.slug,
      featured: featured.get(b.slug) ?? false,
      mergeInto: b.mergeInto || undefined,
      answerBox: clean(b.answerBox),
      intro: clean(b.intro),
      disclosure: clean(b.disclosure),
      paragraphs: (b.body ?? []).map((t) => ({ text: stripTodo(t) })),
      modelsServiced: (b.modelsServiced ?? []).map((m) => ({ model: m })),
      typesServiced: (b.typesServiced ?? []).map((v) => ({ value: v })),
      capabilities: (b.capabilities ?? []).map((c) => ({ item: c.item, detail: clean(c.detail) })),
      faqs: (b.faqs ?? []).filter((q) => q.question && q.answer).map((q) => ({ question: stripTodo(q.question), answer: stripTodo(q.answer) })),
      images: (b.images ?? []).filter((im) => im.src).map((im) => ({ url: im.src, alt: im.alt || b.name })),
      relatedServices: b.relatedServices ?? [],
      relatedBrands: b.relatedBrands ?? [],
      relatedIndustries: b.relatedIndustries ?? [],
      seo: { title: clean(b.seoTitle), description: clean(b.seoDescription) },
      _status: 'published' as const,
    }
    const existing = await payload.find({ collection: 'oem-brands', where: { slug: { equals: b.slug } }, limit: 1, draft: true })
    if (existing.docs.length) {
      await payload.update({ collection: 'oem-brands', id: existing.docs[0].id, data })
      updated++
    } else {
      await payload.create({ collection: 'oem-brands', data })
      created++
    }
  }
  console.log(`DONE — brands created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

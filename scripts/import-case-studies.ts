// Imports content-migration/case-studies.json into the case-studies collection.
// Run: pnpm tsx scripts/import-case-studies.ts
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
function truncate(s: string | undefined, n: number): string | undefined {
  if (!s || s.length <= n) return s
  const cut = s.slice(0, n)
  const sp = cut.lastIndexOf(' ')
  return (sp > 40 ? cut.slice(0, sp) : cut).trim()
}
type Img = { src: string; alt?: string }
type CS = {
  slug: string; title: string; clientIndustry?: string; machineBrandModel?: string; problem?: string
  scopeOfWork?: string[]; beforeAfter?: { before: Img; after: Img }[]; gallery?: Img[]
  timeline?: string; outcome?: string; hero?: Img
  relatedBrands?: { label: string; href: string }[]; relatedServices?: { label: string; href: string }[]
  seoTitle?: string; seoDescription?: string
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const items = JSON.parse(readFileSync(resolve(root, 'content-migration/case-studies.json'), 'utf8')) as CS[]
  let created = 0, updated = 0
  for (const it of items) {
    if (!it.slug || !it.title) continue
    const data = {
      title: it.title,
      slug: it.slug,
      clientIndustry: clean(it.clientIndustry),
      machineBrandModel: clean(it.machineBrandModel),
      hero: it.hero?.src ? { url: it.hero.src, alt: it.hero.alt || it.title } : undefined,
      problem: clean(it.problem),
      scopeItems: (it.scopeOfWork ?? []).map((v) => ({ value: stripTodo(v) })),
      beforeAfterUrls: (it.beforeAfter ?? []).filter((p) => p.before?.src && p.after?.src).map((p) => ({
        beforeUrl: p.before.src, beforeAlt: p.before.alt || 'Before', afterUrl: p.after.src, afterAlt: p.after.alt || 'After',
      })),
      gallery: (it.gallery ?? []).filter((im) => im.src).map((im) => ({ url: im.src, alt: im.alt || it.title })),
      timeline: clean(it.timeline),
      outcome: clean(it.outcome),
      relatedServices: it.relatedServices ?? [],
      relatedBrands: it.relatedBrands ?? [],
      seo: { title: truncate(clean(it.seoTitle), 60), description: truncate(clean(it.seoDescription), 155) },
      _status: 'published' as const,
    }
    const ex = await payload.find({ collection: 'case-studies', where: { slug: { equals: it.slug } }, limit: 1, draft: true })
    if (ex.docs.length) { await payload.update({ collection: 'case-studies', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'case-studies', data }); created++ }
  }
  console.log(`DONE — case studies created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

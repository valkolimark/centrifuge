// Imports content-migration/blog.json into the posts collection.
// Run: pnpm tsx scripts/import-blog.ts
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
  const cut = s.slice(0, n); const sp = cut.lastIndexOf(' ')
  return (sp > 40 ? cut.slice(0, sp) : cut).trim()
}
type Post = {
  slug: string; title: string; excerpt?: string; publishedAt?: string; hero?: { src: string; alt?: string }
  sections?: { heading: string; body: string[] }[]
  internalLinks?: { label: string; href: string }[]; faqs?: { question: string; answer: string }[]
  seoTitle?: string; seoDescription?: string
}

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })
  const items = JSON.parse(readFileSync(resolve(root, 'content-migration/blog.json'), 'utf8')) as Post[]
  let created = 0, updated = 0
  for (const it of items) {
    if (!it.slug || !it.title) continue
    const data = {
      title: it.title,
      slug: it.slug,
      excerpt: clean(it.excerpt),
      hero: it.hero?.src ? { url: it.hero.src, alt: it.hero.alt || it.title } : undefined,
      sections: (it.sections ?? []).map((s) => ({ heading: stripTodo(s.heading), body: (s.body ?? []).map((t) => ({ text: stripTodo(t) })) })),
      internalLinks: it.internalLinks ?? [],
      faqs: (it.faqs ?? []).filter((q) => q.question && q.answer).map((q) => ({ question: stripTodo(q.question), answer: stripTodo(q.answer) })),
      publishedAt: it.publishedAt || undefined,
      seo: { title: truncate(clean(it.seoTitle), 60), description: truncate(clean(it.seoDescription), 155) },
      _status: 'published' as const,
    }
    const ex = await payload.find({ collection: 'posts', where: { slug: { equals: it.slug } }, limit: 1, draft: true })
    if (ex.docs.length) { await payload.update({ collection: 'posts', id: ex.docs[0].id, data }); updated++ }
    else { await payload.create({ collection: 'posts', data }); created++ }
  }
  console.log(`DONE — posts created ${created}, updated ${updated}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })

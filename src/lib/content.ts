// Loads migrated/authored content from content-migration/*.json (produced by the
// extraction agents). Read at build time in server components. Returns null/[] when
// a file is absent so templates can fall back gracefully.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(process.cwd(), 'content-migration')

// Strip inline "TODO(verify: …)" notes from any rendered string so they never show
// to visitors. The dedicated `todos` array is preserved untouched for the client.
export function stripTodo(s: string): string {
  return s.replace(/\s*TODO\([^)]*\)\.?/g, '').replace(/\s{2,}/g, ' ').trim()
}
function sanitize<T>(value: T, key?: string): T {
  if (key === 'todos') return value
  if (typeof value === 'string') return stripTodo(value) as unknown as T
  if (Array.isArray(value)) return value.map((v) => sanitize(v)) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v, k)
    return out as T
  }
  return value
}

function readJson<T>(rel: string): T | null {
  const p = join(ROOT, rel)
  if (!existsSync(p)) return null
  try {
    return sanitize(JSON.parse(readFileSync(p, 'utf8')) as T)
  } catch {
    return null
  }
}

// ── OEM brands (one file per slug) ────────────────────────────
export interface LinkItem { label: string; href: string }
export interface ImageItem { src: string; alt: string }
export interface BrandContent {
  slug: string
  name: string
  answerBox?: string
  intro?: string
  disclosure?: string
  modelsServiced?: string[]
  typesServiced?: string[]
  capabilities?: { item: string; detail?: string }[]
  body?: string[]
  faqs?: { question: string; answer: string }[]
  images?: ImageItem[]
  relatedBrands?: LinkItem[]
  relatedServices?: LinkItem[]
  relatedIndustries?: LinkItem[]
  seoTitle?: string
  seoDescription?: string
  todos?: string[]
  mergeInto?: string | null
}

// Payload-first (editable in /admin), JSON fallback (build safety / un-migrated).
export async function getBrandContent(slug: string): Promise<BrandContent | null> {
  try {
    const { getBrandFromCMS } = await import('./cms')
    const fromCms = await getBrandFromCMS(slug)
    if (fromCms) return fromCms
  } catch {
    /* DB unavailable → fall back to JSON */
  }
  return readJson<BrandContent>(`oem/${slug}.json`)
}

export function listBrandContentSlugs(): string[] {
  const dir = join(ROOT, 'oem')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}

// ── Industries (single array file) ────────────────────────────
export interface IndustryContent {
  slug: string
  name: string
  answerBox?: string
  intro?: string
  typicalEquipment?: { text: string; links?: LinkItem[] }[]
  failureModes?: string[]
  relevantServices?: LinkItem[]
  relatedBrands?: LinkItem[]
  faqs?: { question: string; answer: string }[]
  hero?: ImageItem
  seoTitle?: string
  seoDescription?: string
  todos?: string[]
}
export async function getIndustries(): Promise<IndustryContent[]> {
  try {
    const { getIndustriesFromCMS } = await import('./cms')
    const fromCms = await getIndustriesFromCMS()
    if (fromCms.length) return fromCms
  } catch {
    /* DB unavailable → JSON */
  }
  return readJson<IndustryContent[]>('industries.json') ?? []
}
export async function getIndustry(slug: string): Promise<IndustryContent | undefined> {
  return (await getIndustries()).find((i) => i.slug === slug)
}

// ── How it works ──────────────────────────────────────────────
export interface HowItWorksContent {
  slug: string
  title: string
  answerBox?: string
  sections?: { heading: string; body: string[] }[]
  signsNeedRepair?: string[]
  videoId?: string | null
  relatedService?: LinkItem
  relatedBrands?: LinkItem[]
  faqs?: { question: string; answer: string }[]
  seoTitle?: string
  seoDescription?: string
  todos?: string[]
}
export function getHowItWorks(): HowItWorksContent[] {
  return readJson<HowItWorksContent[]>('how-it-works.json') ?? []
}
export function getHowItWorksItem(slug: string): HowItWorksContent | undefined {
  return getHowItWorks().find((h) => h.slug === slug)
}

// ── Case studies ──────────────────────────────────────────────
export interface CaseStudyContent {
  slug: string
  title: string
  clientIndustry?: string
  machineBrandModel?: string
  problem?: string
  scopeOfWork?: string[]
  beforeAfter?: { before: ImageItem; after: ImageItem }[]
  gallery?: ImageItem[]
  timeline?: string
  outcome?: string
  hero?: ImageItem
  seoTitle?: string
  seoDescription?: string
  relatedBrands?: LinkItem[]
  relatedServices?: LinkItem[]
  todos?: string[]
}
export async function getCaseStudies(): Promise<CaseStudyContent[]> {
  try {
    const { getCaseStudiesFromCMS } = await import('./cms')
    const fromCms = await getCaseStudiesFromCMS()
    if (fromCms.length) return fromCms
  } catch {
    /* DB unavailable → JSON */
  }
  return readJson<CaseStudyContent[]>('case-studies.json') ?? []
}
export async function getCaseStudy(slug: string): Promise<CaseStudyContent | undefined> {
  return (await getCaseStudies()).find((c) => c.slug === slug)
}

// ── Blog ──────────────────────────────────────────────────────
export interface BlogPostContent {
  slug: string
  title: string
  excerpt?: string
  publishedAt?: string
  hero?: ImageItem
  sections?: { heading: string; body: string[] }[]
  internalLinks?: LinkItem[]
  faqs?: { question: string; answer: string }[]
  seoTitle?: string
  seoDescription?: string
  todos?: string[]
}
export async function getBlogPosts(): Promise<BlogPostContent[]> {
  try {
    const { getBlogPostsFromCMS } = await import('./cms')
    const fromCms = await getBlogPostsFromCMS()
    if (fromCms.length) return fromCms
  } catch {
    /* DB unavailable → JSON */
  }
  return readJson<BlogPostContent[]>('blog.json') ?? []
}
export async function getBlogPost(slug: string): Promise<BlogPostContent | undefined> {
  return (await getBlogPosts()).find((p) => p.slug === slug)
}

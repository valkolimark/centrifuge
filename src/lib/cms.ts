// Payload-backed loaders for migrated content. Each returns the same shape the
// frontend already uses (see content.ts interfaces). content.ts calls these first
// and falls back to the JSON files if the DB is empty/unavailable — so the site
// works whether or not a given collection has been migrated yet.
import { getPayloadClient } from './payload'
import type { BrandContent, IndustryContent, LinkItem } from './content'

type Row = Record<string, unknown>
const links = (v: unknown): LinkItem[] =>
  Array.isArray(v) ? v.map((l) => ({ label: String((l as Row).label ?? ''), href: String((l as Row).href ?? '') })).filter((l) => l.label && l.href) : []
const strings = (v: unknown, key: string): string[] =>
  Array.isArray(v) ? v.map((r) => String((r as Row)[key] ?? '')).filter(Boolean) : []
const faqs = (v: unknown) =>
  Array.isArray(v) ? (v as Row[]).map((q) => ({ question: String(q.question ?? ''), answer: String(q.answer ?? '') })).filter((q) => q.question && q.answer) : []

export async function getBrandFromCMS(slug: string): Promise<BrandContent | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'oem-brands',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 1,
  })
  const d = res.docs[0] as unknown as Row | undefined
  if (!d) return null
  const seo = (d.seo as { title?: string; description?: string } | undefined) ?? {}
  return {
    slug: d.slug as string,
    name: d.name as string,
    answerBox: (d.answerBox as string) || undefined,
    intro: (d.intro as string) || undefined,
    disclosure: (d.disclosure as string) || undefined,
    modelsServiced: strings(d.modelsServiced, 'model'),
    typesServiced: strings(d.typesServiced, 'value'),
    capabilities: Array.isArray(d.capabilities)
      ? (d.capabilities as Row[]).map((c) => ({ item: String(c.item ?? ''), detail: (c.detail as string) || undefined })).filter((c) => c.item)
      : [],
    body: strings(d.paragraphs, 'text'),
    faqs: Array.isArray(d.faqs)
      ? (d.faqs as Row[]).map((q) => ({ question: String(q.question ?? ''), answer: String(q.answer ?? '') })).filter((q) => q.question && q.answer)
      : [],
    images: Array.isArray(d.images)
      ? (d.images as Row[]).map((im) => ({ src: String(im.url ?? ''), alt: String(im.alt ?? '') })).filter((im) => im.src)
      : [],
    relatedServices: links(d.relatedServices),
    relatedBrands: links(d.relatedBrands),
    relatedIndustries: links(d.relatedIndustries),
    seoTitle: seo.title || undefined,
    seoDescription: seo.description || undefined,
    mergeInto: (d.mergeInto as string) || null,
  }
}

// ── Industries ──────────────────────────────────────────────
function mapIndustry(d: Row): IndustryContent {
  const seo = (d.seo as { title?: string; description?: string } | undefined) ?? {}
  const hero = d.hero as { url?: string; alt?: string } | undefined
  return {
    slug: d.slug as string,
    name: d.title as string,
    answerBox: (d.answerBox as string) || undefined,
    intro: (d.intro as string) || undefined,
    typicalEquipment: Array.isArray(d.typicalEquipment)
      ? (d.typicalEquipment as Row[]).map((e) => ({ text: String(e.text ?? ''), links: links(e.links) })).filter((e) => e.text)
      : [],
    failureModes: strings(d.failureModes, 'value'),
    relevantServices: links(d.relevantServices),
    relatedBrands: links(d.relatedBrands),
    faqs: faqs(d.faqs),
    hero: hero?.url ? { src: hero.url, alt: hero.alt || (d.title as string) } : undefined,
    seoTitle: seo.title || undefined,
    seoDescription: seo.description || undefined,
  }
}

export async function getIndustriesFromCMS(): Promise<IndustryContent[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'industries', where: { _status: { equals: 'published' } }, depth: 0, limit: 100 })
  return res.docs.map((d) => mapIndustry(d as unknown as Row))
}

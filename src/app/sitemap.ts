import type { MetadataRoute } from 'next'
import { SITE_URL, brands, locations } from '@/lib/site'
import { INDUSTRIES } from '@/lib/stubs'
import { getPayloadClient } from '@/lib/payload'
import { getBrandContent, getHowItWorks, getCaseStudies, getBlogPosts } from '@/lib/content'
import { USED_CATEGORIES } from '@/content/used-centrifuges'

// Sitemap: static routes + published services + content routes (brands/industries/
// how-it-works/case-studies/blog). Merged brands (redirects) are excluded.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now: MetadataRoute.Sitemap = []
  const add = (path: string, priority = 0.7) =>
    now.push({ url: `${SITE_URL}${path}`, changeFrequency: 'weekly', priority })

  ;['/', '/services/', '/brands/', '/industries/', '/locations/', '/about/', '/sell-your-centrifuge/', '/resources/', '/resources/how-it-works/', '/resources/case-studies/', '/resources/blog/', '/resources/faqs/', '/resources/videos/', '/cw-ez-quote-for-sales/', '/contact-cw/', '/privacy-policy/', '/terms-of-use/'].forEach((p) =>
    add(p, p === '/' ? 1 : 0.7),
  )

  // Services from Payload
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'services', where: { _status: { equals: 'published' } }, limit: 100, depth: 0 })
    for (const d of res.docs) add(`/services/${(d as { slug: string }).slug}/`, 0.8)
  } catch {
    /* DB unavailable at build */
  }

  // Brands with harvested content (skip merged → they redirect)
  for (const b of brands) {
    const c = getBrandContent(b.slug)
    if (c && !c.mergeInto) add(`/brands/${b.slug}/`, 0.7)
  }
  for (const i of INDUSTRIES) add(`/industries/${i.slug}/`, 0.7)
  for (const l of locations) add(`/locations/${l.id}/`, 0.7)
  add('/used-centrifuges/', 0.8)
  for (const u of USED_CATEGORIES) add(`/used-centrifuges/${u.slug}/`, 0.8)
  for (const h of getHowItWorks()) add(`/resources/how-it-works/${h.slug}/`, 0.6)
  for (const c of getCaseStudies()) add(`/resources/case-studies/${c.slug}/`, 0.6)
  for (const p of getBlogPosts()) add(`/resources/blog/${p.slug}/`, 0.6)

  return now
}

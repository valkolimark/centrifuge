import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getPayloadClient } from '@/lib/payload'

// Sitemap (Cycle 2). Home + indexable index pages + published service pages.
// Cycle 4 replaces this with segmented sitemaps and adds industries/brands once
// those pages are authored (their interim stubs are noindexed and excluded here).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['/', '/services/', '/brands/', '/industries/', '/request-a-quote/', '/contact/']
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      limit: 100,
      depth: 0,
    })
    for (const doc of res.docs) {
      entries.push({
        url: `${SITE_URL}/services/${(doc as { slug: string }).slug}/`,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }
  } catch {
    // DB unavailable at build — static routes still emit.
  }

  return entries
}

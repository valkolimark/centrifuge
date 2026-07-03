import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Sitemap (task 1.6). Cycle 1 has only the home route publicly; /styleguide is
// noindexed and excluded. Cycle 4 replaces this with segmented sitemaps
// (pages/services/brands/industries/locations/resources) sourced from Payload.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}

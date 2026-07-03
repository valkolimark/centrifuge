import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// robots.txt (task 1.6). Allow all; block admin/auth/styleguide/api surfaces.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/styleguide', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

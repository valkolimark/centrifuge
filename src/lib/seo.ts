// Metadata helper (task 1.6). Builds Next.js Metadata from CMS-style SEO fields,
// enforcing the Definition of Done: unique title (<=60), description (<=155),
// self-referencing canonical, optional noindex. In Cycle 2+ the `seo` arg comes
// straight from a collection's SEO field group.
import type { Metadata } from 'next'
import { SITE_URL, org } from './site'

export interface SeoFields {
  title: string
  description?: string
  canonicalOverride?: string
  ogImage?: string
  noindex?: boolean
}

/** Absolute URL for a site-relative path. */
export function absUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function buildMetadata(seo: SeoFields, path: string): Metadata {
  const canonical = seo.canonicalOverride || absUrl(path)
  const title = seo.title
  const description = seo.description
  const ogImage = seo.ogImage || `${SITE_URL}/og-default.png`

  if (process.env.NODE_ENV !== 'production') {
    if (title.length > 60) console.warn(`[seo] title >60 chars (${title.length}): ${title}`)
    if (description && description.length > 155)
      console.warn(`[seo] description >155 chars (${description.length})`)
  }

  return {
    title,
    description,
    alternates: { canonical },
    robots: seo.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: org.name,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export const metadataBase = new URL(SITE_URL)

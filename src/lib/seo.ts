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

const BRAND_SUFFIX = ` | ${org.name}`

/** Word-safe truncate to n chars. */
function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const sp = cut.lastIndexOf(' ')
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s|,–-]+$/, '').trim()
}

/** Enforce ≤60 while preserving the " | Centrifuge World" suffix when present. */
function fitTitle(t: string): string {
  if (t.length <= 60) return t
  if (t.endsWith(BRAND_SUFFIX)) {
    const head = truncate(t.slice(0, -BRAND_SUFFIX.length), 60 - BRAND_SUFFIX.length)
    return head + BRAND_SUFFIX
  }
  return truncate(t, 60)
}

export function buildMetadata(seo: SeoFields, path: string): Metadata {
  const canonical = seo.canonicalOverride || absUrl(path)
  // Titles already include the brand ("… | Centrifuge World"); use `absolute` so
  // the layout template doesn't append the brand a second time. Enforce ≤60/≤155.
  const title = fitTitle(seo.title)
  const description = seo.description ? truncate(seo.description, 155) : undefined
  const ogImage = seo.ogImage || `${SITE_URL}/og-default.png`

  return {
    title: { absolute: title },
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

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

// Maps a collection to its public URL prefix so publish/save triggers ISR
// revalidation of the affected route (task 1.2 acceptance). Collections without a
// public URL are omitted (no revalidation).
//
// Keeping this map complete is what lets the routes run long `revalidate` windows:
// a collection missing here has no on-demand revalidation, so its only path to
// freshness is the timer — which is why inventory sat at 300s and generated the bulk
// of the site's background database load. Add new public collections here.
const PREFIX: Record<string, string> = {
  pages: '',
  services: '/services',
  'oem-brands': '/brands',
  industries: '/industries',
  locations: '/locations',
  posts: '/resources/blog',
  'case-studies': '/resources/case-studies',
  faqs: '/resources/faqs',
  inventory: '/inventory',
  'how-it-works': '/resources/how-it-works',
}

// Index/listing routes that also change when a doc in the collection changes. The
// detail page alone isn't enough — a new machine has to show up on /inventory/ too.
const INDEXES: Record<string, string[]> = {
  services: ['/services', '/sitemap.xml'],
  'oem-brands': ['/brands', '/sitemap.xml'],
  industries: ['/industries', '/sitemap.xml'],
  locations: ['/locations', '/sitemap.xml'],
  posts: ['/resources/blog', '/sitemap.xml'],
  'case-studies': ['/resources/case-studies', '/sitemap.xml'],
  faqs: ['/resources/faqs'],
  inventory: ['/inventory', '/used-centrifuges', '/sitemap.xml'],
  'how-it-works': ['/resources/how-it-works', '/sitemap.xml'],
}

function pathFor(collection: string, slug?: string): string | null {
  const prefix = PREFIX[collection]
  if (prefix === undefined) return null
  if (collection === 'pages') return `/${slug ?? ''}`
  return `${prefix}/${slug ?? ''}`
}

function revalidateFor(collection: string, slug?: string): void {
  const paths = [pathFor(collection, slug), ...(INDEXES[collection] ?? [])].filter(
    (p): p is string => !!p,
  )
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch {
      // revalidatePath is a no-op outside the Next request scope (e.g. seed script).
    }
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, collection }) => {
  revalidateFor(collection.slug, doc?.slug)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, collection }) => {
  revalidateFor(collection.slug, doc?.slug)
  return doc
}

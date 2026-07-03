import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

// Maps a collection to its public URL prefix so publish/save triggers ISR
// revalidation of the affected route (task 1.2 acceptance). Collections without a
// public URL are omitted (no revalidation).
const PREFIX: Record<string, string> = {
  pages: '',
  services: '/services',
  'oem-brands': '/brands',
  industries: '/industries',
  locations: '/locations',
  posts: '/resources/blog',
  'case-studies': '/resources/case-studies',
  faqs: '/resources/faqs',
}

function pathFor(collection: string, slug?: string): string | null {
  const prefix = PREFIX[collection]
  if (prefix === undefined) return null
  if (collection === 'pages') return `/${slug ?? ''}`
  return `${prefix}/${slug ?? ''}`
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, collection }) => {
  const path = pathFor(collection.slug, doc?.slug)
  if (path) {
    try {
      revalidatePath(path)
    } catch {
      // revalidatePath is a no-op outside the Next request scope (e.g. seed script).
    }
  }
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, collection }) => {
  const path = pathFor(collection.slug, doc?.slug)
  if (path) {
    try {
      revalidatePath(path)
    } catch {
      /* ignore outside request scope */
    }
  }
  return doc
}

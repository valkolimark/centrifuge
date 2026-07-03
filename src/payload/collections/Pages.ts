import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

// Generic pages (home, about, legal). Block-composed body is built out in Cycle 2.
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

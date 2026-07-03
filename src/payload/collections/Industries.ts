import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

// Industry pages (Cycle 4 authors content).
export const Industries: CollectionConfig = {
  slug: 'industries',
  labels: { singular: 'Industry', plural: 'Industries' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'answerBox', type: 'textarea' },
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

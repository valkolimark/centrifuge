import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

// Location pages (Cycle 4). NAP is seeded from data/nap.json and remains the
// reference source; these fields mirror it for CMS editability.
export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'label', type: 'text', required: true },
    slugField('label'),
    {
      type: 'row',
      fields: [
        { name: 'streetAddress', type: 'text', required: true },
        { name: 'addressLocality', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'addressRegion', type: 'text', required: true },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'phoneRole', type: 'text', admin: { description: 'nap.json phone role key.' } },
      ],
    },
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

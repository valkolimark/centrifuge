import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

// OEM brand pages (Cycle 3 builds out content). Seeded from data/oem-brands.json.
export const OEMBrands: CollectionConfig = {
  slug: 'oem-brands',
  labels: { singular: 'OEM Brand', plural: 'OEM Brands' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'featured', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Corrected canonical spelling only (never legacy).' } },
    slugField('name'),
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'modelsServiced',
      type: 'array',
      labels: { singular: 'Model', plural: 'Models' },
      fields: [{ name: 'model', type: 'text', required: true }],
    },
    {
      name: 'disclosure',
      type: 'textarea',
      admin: { description: 'Independent-service disclosure line (legally clean positioning).' },
    },
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

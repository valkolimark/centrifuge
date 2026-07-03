import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'
import { linkArray, faqArray, imageArray, paragraphs, stringArray, capabilityArray } from '../fields/content-fields'

// OEM brand pages. Content migrated from content-migration/oem/*.json — fully
// editable here; the /brands/[slug] template reads this collection (JSON fallback).
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
    { name: 'mergeInto', type: 'text', admin: { position: 'sidebar', description: 'If set, this brand 301-redirects to /brands/<slug>.' } },
    { name: 'answerBox', type: 'textarea', admin: { description: '40–60 word direct answer under the H1 (AEO).' } },
    { name: 'intro', type: 'textarea', admin: { description: 'Hero subtitle / lead paragraph.' } },
    {
      name: 'disclosure',
      type: 'textarea',
      admin: { description: 'Independent-service disclosure line (legally clean positioning).' },
    },
    paragraphs('paragraphs', 'Body paragraphs'),
    {
      name: 'modelsServiced',
      type: 'array',
      labels: { singular: 'Model', plural: 'Models' },
      fields: [{ name: 'model', type: 'text', required: true }],
    },
    stringArray('typesServiced', 'Centrifuge types serviced', 'Type'),
    capabilityArray(),
    faqArray(),
    imageArray('images', 'Gallery images'),
    linkArray('relatedServices', 'Related services'),
    linkArray('relatedBrands', 'Related brands'),
    linkArray('relatedIndustries', 'Related industries'),
    // Legacy richText body kept (optional, unused) so the change stays additive.
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'
import { linkArray, faqArray, stringArray } from '../fields/content-fields'

// Industry pages. Content migrated from content-migration/industries.json —
// editable here; the /industries/[slug] template reads this collection (JSON fallback).
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
    { name: 'answerBox', type: 'textarea', admin: { description: '40–60 word direct answer under the H1 (AEO).' } },
    { name: 'intro', type: 'textarea' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'url', type: 'text', admin: { description: 'Hero image URL (S3).' } },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'typicalEquipment',
      type: 'array',
      labels: { singular: 'Equipment', plural: 'Typical equipment' },
      fields: [{ name: 'text', type: 'textarea', required: true }, linkArray('links', 'Cross-links')],
    },
    stringArray('failureModes', 'Failure modes', 'Failure mode'),
    linkArray('relevantServices', 'Relevant services'),
    linkArray('relatedBrands', 'Related brands'),
    faqArray(),
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

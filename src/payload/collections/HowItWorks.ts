import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'
import { linkArray, faqArray, stringArray, paragraphs } from '../fields/content-fields'

// "How centrifuges work" educational library. Content migrated from
// content-migration/how-it-works.json — editable here; the
// /resources/how-it-works/[slug] template reads this collection (JSON fallback).
export const HowItWorks: CollectionConfig = {
  slug: 'how-it-works',
  labels: { singular: 'How-It-Works Guide', plural: 'How It Works' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'answerBox', type: 'textarea', admin: { description: '40–60 word direct answer under the H1 (AEO).' } },
    { name: 'aeoPanel', type: 'ui', admin: { components: { Field: '@/payload/admin/fields/AeoPanel' } } },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      fields: [{ name: 'heading', type: 'text', required: true }, paragraphs('body', 'Paragraphs')],
    },
    stringArray('signsNeedRepair', 'Signs it needs repair', 'Sign'),
    { name: 'videoId', type: 'text', admin: { description: 'YouTube video ID (optional).' } },
    linkArray('relatedService', 'Related service (single)'),
    linkArray('relatedBrands', 'Related brands'),
    faqArray(),
    seoField,
  ],
}

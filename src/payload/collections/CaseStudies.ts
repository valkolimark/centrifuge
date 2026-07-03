import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, publishableHooks } from './shared'

// Case studies (Cycle 5). Never publish a client name without written permission —
// default to "Confidential [industry] client". Outcome/timeline stay TODO(verify)
// until the client confirms; entries publish as drafts pending sign-off.
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case Study', plural: 'Case Studies' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: publishableHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'clientIndustry',
      type: 'text',
      admin: { description: 'e.g. "Confidential rendering client" — no real names without written permission.' },
    },
    { name: 'machineBrandModel', type: 'text' },
    { name: 'problem', type: 'textarea' },
    { name: 'scopeOfWork', type: 'richText' },
    {
      name: 'beforeAfter',
      type: 'array',
      labels: { singular: 'Image pair', plural: 'Image pairs' },
      fields: [
        { name: 'before', type: 'upload', relationTo: 'media', required: true },
        { name: 'after', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    { name: 'timeline', type: 'text', admin: { description: 'TODO(verify) until client confirms.' } },
    { name: 'outcome', type: 'textarea', admin: { description: 'TODO(verify) until client confirms.' } },
    seoField,
  ],
}

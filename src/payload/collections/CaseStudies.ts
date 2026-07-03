import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, publishableHooks } from './shared'
import { linkArray, imageArray, stringArray } from '../fields/content-fields'

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
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'alt', type: 'text' },
      ],
    },
    { name: 'problem', type: 'textarea' },
    stringArray('scopeItems', 'Scope of work', 'Scope item'),
    {
      name: 'beforeAfterUrls',
      type: 'array',
      labels: { singular: 'Before/after pair', plural: 'Before/after pairs' },
      fields: [
        { name: 'beforeUrl', type: 'text', required: true },
        { name: 'beforeAlt', type: 'text' },
        { name: 'afterUrl', type: 'text', required: true },
        { name: 'afterAlt', type: 'text' },
      ],
    },
    imageArray('gallery', 'Gallery images'),
    { name: 'timeline', type: 'text', admin: { description: 'TODO(verify) until client confirms.' } },
    { name: 'outcome', type: 'textarea', admin: { description: 'TODO(verify) until client confirms.' } },
    linkArray('relatedServices', 'Related services'),
    linkArray('relatedBrands', 'Related brands'),
    // Legacy upload-based fields kept (optional, unused) so the change is additive.
    { name: 'scopeOfWork', type: 'richText' },
    {
      name: 'beforeAfter',
      type: 'array',
      labels: { singular: 'Image pair (upload)', plural: 'Image pairs (upload)' },
      fields: [
        { name: 'before', type: 'upload', relationTo: 'media' },
        { name: 'after', type: 'upload', relationTo: 'media' },
      ],
    },
    seoField,
  ],
}

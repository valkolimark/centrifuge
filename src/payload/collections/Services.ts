import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

// Services (task 1.2 scaffolding; the block-composed template is authored in Cycle 2).
export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'answerBoxQuestion',
      type: 'text',
      admin: { description: 'Primary AEO question (see data/faq-bank.md).' },
    },
    {
      name: 'answerBox',
      type: 'textarea',
      admin: { description: '40–60 word direct answer placed under the H1.' },
    },
    { name: 'body', type: 'richText' },
    {
      name: 'faqs',
      type: 'array',
      labels: { singular: 'FAQ', plural: 'FAQs' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    seoField,
  ],
}

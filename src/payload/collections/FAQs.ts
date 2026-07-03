import type { CollectionConfig } from 'payload'
import { contentAccess, contentVersions, publishableHooks } from './shared'

// FAQs (task 1.2). Seeded from data/faq-bank.md global bank. Content-managers MAY
// publish. The FAQ hub + per-page FAQ blocks read from here.
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'category', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: publishableHooks,
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Repair & Rebuilds', value: 'repair-rebuilds' },
        { label: 'Emergency & Field Service', value: 'emergency-field' },
        { label: 'Parts & Fabrication', value: 'parts-fabrication' },
        { label: 'Buying & Selling', value: 'buying-selling' },
        { label: 'Costs & Turnaround', value: 'costs-turnaround' },
      ],
    },
    {
      name: 'deepLink',
      type: 'text',
      admin: { description: 'Path to the deep page this answer links to.' },
    },
  ],
}

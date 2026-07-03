import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, guardedHooks } from './shared'

const FORM_TYPES = [
  { label: 'Request a Quote', value: 'request_quote' },
  { label: 'Emergency Service', value: 'emergency_service' },
  { label: 'Free Inspection', value: 'free_inspection' },
  { label: 'Contact', value: 'contact' },
  { label: 'Send Photos', value: 'send_photos' },
]

const linkArray = (name: string, label: string) => ({
  name,
  type: 'array' as const,
  label,
  fields: [
    { name: 'label', type: 'text' as const, required: true },
    { name: 'href', type: 'text' as const, required: true },
  ],
})

// Services (task 2.2). Block-composed template fields. The /services/[slug] route
// renders these in a fixed order; content is seeded/authored in task 2.3.
export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'formType', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: guardedHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        { name: 'h1', type: 'text', admin: { description: 'Page H1 (defaults to title).' } },
        {
          name: 'formType',
          type: 'select',
          defaultValue: 'request_quote',
          options: FORM_TYPES,
          admin: { description: 'Which lead form embeds on this page.' },
        },
      ],
    },
    { name: 'answerBoxQuestion', type: 'text', admin: { description: 'AEO question (data/faq-bank.md).' } },
    { name: 'answerBox', type: 'textarea', admin: { description: '40–60 word direct answer under the H1.' } },
    { name: 'intro', type: 'textarea', admin: { description: 'Lead paragraph after the answer box.' } },
    {
      name: 'capabilitiesHeading',
      type: 'text',
      defaultValue: 'What we do',
    },
    {
      name: 'capabilities',
      type: 'array',
      labels: { singular: 'Capability', plural: 'Capabilities' },
      fields: [
        { name: 'item', type: 'text', required: true },
        { name: 'detail', type: 'textarea' },
      ],
    },
    {
      name: 'processHeading',
      type: 'text',
      defaultValue: 'How it works',
    },
    {
      name: 'process',
      type: 'array',
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'faqs',
      type: 'array',
      labels: { singular: 'FAQ', plural: 'FAQs' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    linkArray('relatedServices', 'Related services'),
    linkArray('relatedBrands', 'Related brands'),
    linkArray('relatedIndustries', 'Related industries'),
    // Kept (optional, unused by the current template) so the schema change stays
    // additive — dropping it would make dev schema-push prompt for a rename.
    { name: 'body', type: 'richText', admin: { description: 'Optional long-form body (not rendered by the block template).' } },
    {
      name: 'emergencyVariant',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Use the safety-red emergency hero treatment.' },
    },
    seoField,
  ],
}

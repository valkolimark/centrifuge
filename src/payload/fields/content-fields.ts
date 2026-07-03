import type { Field } from 'payload'

// Reusable field builders for the migrated content collections (brands,
// industries, case studies, posts, FAQs, how-it-works). Keeps schemas DRY and
// consistent so the frontend loaders map every collection the same way.

export const linkArray = (name: string, label: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Link', plural: 'Links' },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'href', type: 'text', required: true },
  ],
})

export const faqArray = (name = 'faqs', label = 'FAQs'): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
  ],
})

// External image references (S3/CDN URLs) — matches the frontend {src, alt} shape.
export const imageArray = (name = 'images', label = 'Images'): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'url', type: 'text', required: true, admin: { description: 'Image URL (e.g. an S3 URL).' } },
    { name: 'alt', type: 'text', required: true },
  ],
})

// Body copy as an ordered list of paragraphs (maps to string[]).
export const paragraphs = (name = 'paragraphs', label = 'Body paragraphs'): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Paragraph', plural: 'Paragraphs' },
  fields: [{ name: 'text', type: 'textarea', required: true }],
})

// Simple list of strings (models, types, bullets…).
export const stringArray = (name: string, label: string, itemLabel = 'Item'): Field => ({
  name,
  type: 'array',
  label,
  fields: [{ name: 'value', type: 'text', required: true, label: itemLabel }],
})

export const capabilityArray = (name = 'capabilities', label = 'Capabilities'): Field => ({
  name,
  type: 'array',
  label,
  fields: [
    { name: 'item', type: 'text', required: true },
    { name: 'detail', type: 'textarea' },
  ],
})

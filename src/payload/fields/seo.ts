import type { Field } from 'payload'

// Shared SEO field group (task 1.2). Attached to every collection with public URLs.
// Enforces the Definition of Done limits at the CMS layer (maxLength).
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { description: 'Search metadata. Title ≤60, description ≤155 characters.' },
  fields: [
    // Live Google-SERP preview + char-counter bars (UI-1 Content Studio SEO inspector).
    { name: 'seoPreview', type: 'ui', admin: { components: { Field: '@/payload/admin/fields/SeoPreview' } } },
    {
      name: 'title',
      type: 'text',
      maxLength: 60,
      admin: { description: 'Unique <title>, ≤60 chars. Falls back to the page title.' },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 155,
      admin: { description: 'Meta description, ≤155 chars.' },
    },
    {
      name: 'canonicalOverride',
      type: 'text',
      admin: { description: 'Only if this page should canonicalize to a different URL.' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Exclude from search engines and the sitemap.' },
    },
  ],
}

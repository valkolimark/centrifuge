import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, publishableHooks } from './shared'
import { linkArray, faqArray, paragraphs } from '../fields/content-fields'

// Blog posts. Content migrated from content-migration/blog.json — editable here;
// the /resources/blog/[slug] template reads this collection (JSON fallback).
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'publishedAt', '_status'], group: 'Content' },
  access: contentAccess,
  versions: contentVersions,
  hooks: publishableHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      fields: [{ name: 'heading', type: 'text', required: true }, paragraphs('body', 'Paragraphs')],
    },
    linkArray('internalLinks', 'Internal links'),
    faqArray(),
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    // Legacy upload/richText kept (optional, unused) so the change is additive.
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    seoField,
  ],
}

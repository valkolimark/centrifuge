import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, publishableHooks } from './shared'

// Blog posts (Cycle 5). Content-managers MAY publish these (no publish guard).
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
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    seoField,
  ],
}

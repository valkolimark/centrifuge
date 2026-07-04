import type { CollectionConfig } from 'payload'
import { anyAuthenticated, contentManagerUp, publicRead } from '../access/roles'

// Media (task 1.2). Alt text is a required field (CLAUDE.md / DoD). Files are stored
// on Vercel Blob (adapter wired in payload.config); sharp generates responsive sizes.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Library' },
  access: {
    read: publicRead,
    create: contentManagerUp,
    update: contentManagerUp,
    delete: anyAuthenticated,
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'avatar', width: 160, height: 160, position: 'centre' },
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'feature', width: 1600 },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Descriptive alt text — required for accessibility & SEO.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption; include model numbers where known.' },
    },
    // PDF Studio (UI-1 Phase E): entry point + persisted annotation overlay objects.
    { name: 'pdfStudioLink', type: 'ui', admin: { components: { Field: '@/payload/admin/fields/PdfStudioLink' } } },
    { name: 'pdfAnnotations', type: 'json', admin: { hidden: true, description: 'PDF Studio annotation overlay objects.' } },
  ],
}

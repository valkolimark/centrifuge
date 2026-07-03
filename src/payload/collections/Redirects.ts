import type { CollectionConfig } from 'payload'
import { editorUp, publicReadAlways } from '../access/roles'

// Redirects (task 1.2). Editable 301 map. Cycle 6 makes this the source of truth
// and re-emits src/lib/redirects-data.json consumed by middleware; seeded from
// data/redirects.csv + generated OEM slugs.
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'type'], group: 'Admin' },
  access: {
    read: publicReadAlways,
    create: editorUp,
    update: editorUp,
    delete: editorUp,
  },
  fields: [
    { name: 'from', type: 'text', required: true, index: true, admin: { description: 'Legacy path, e.g. /sharples/' } },
    { name: 'to', type: 'text', required: true, admin: { description: 'Target path, e.g. /brands/sharples/' } },
    {
      name: 'type',
      type: 'select',
      defaultValue: '301',
      options: [
        { label: '301 (permanent)', value: '301' },
        { label: '302 (temporary)', value: '302' },
      ],
    },
    { name: 'note', type: 'text' },
  ],
}

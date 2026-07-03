import type { GlobalConfig } from 'payload'
import { editorUp, publicReadAlways } from '../access/roles'

// footer (task 1.2). Seeded from data/navigation.json footer structure.
export const FooterNav: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Navigation' },
  access: { read: publicReadAlways, update: editorUp },
  fields: [
    {
      name: 'structure',
      type: 'json',
      admin: { description: 'Footer column structure (seeded from data/navigation.json).' },
    },
  ],
}

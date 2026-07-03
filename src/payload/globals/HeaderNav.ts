import type { GlobalConfig } from 'payload'
import { editorUp, publicReadAlways } from '../access/roles'

// header-nav (task 1.2). Seeded from data/navigation.json. Editable by editors+.
// Stored as structured JSON for Cycle 1; the header component currently reads the
// data file directly and will switch to this global in Cycle 2.
export const HeaderNav: GlobalConfig = {
  slug: 'header-nav',
  label: 'Header Navigation',
  admin: { group: 'Navigation' },
  access: { read: publicReadAlways, update: editorUp },
  fields: [
    {
      name: 'structure',
      type: 'json',
      admin: { description: 'Header/megamenu structure (seeded from data/navigation.json).' },
    },
  ],
}

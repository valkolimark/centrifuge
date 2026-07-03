import type { GlobalConfig } from 'payload'
import { publicReadAlways, superAdminOnly } from '../access/roles'

// site-settings (task 1.2). Seeded from data/nap.json business facts. Only
// super-admins edit settings (editors have "no users/settings" per CLAUDE.md).
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Settings' },
  access: { read: publicReadAlways, update: superAdminOnly },
  fields: [
    { name: 'companyName', type: 'text' },
    { name: 'foundingYear', type: 'number' },
    { name: 'publicEmail', type: 'text', admin: { description: 'TODO(verify) — see nap.json.' } },
    {
      name: 'trustBar',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'sameAs',
      type: 'array',
      labels: { singular: 'Social URL', plural: 'Social URLs' },
      admin: { description: 'Exact social profile URLs — TODO(verify) in Cycle 4.' },
      fields: [{ name: 'url', type: 'text', required: true }],
    },
  ],
}

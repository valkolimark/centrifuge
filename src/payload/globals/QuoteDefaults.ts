import type { GlobalConfig } from 'payload'
import { anyAuthenticated, superAdminOnly } from '../access/roles'

// QuoteDefaults (UI-2 §2.3) — office-editable boilerplate for new quotes so staff can
// change terms/tax/validity without a code change. New drafts seed from these values.
export const QuoteDefaults: GlobalConfig = {
  slug: 'quote-defaults',
  label: 'Quote Defaults',
  admin: {
    group: 'Leads',
    description: 'Default terms, tax rate, validity, and footer lines applied to new quote drafts.',
  },
  access: { read: anyAuthenticated, update: superAdminOnly },
  fields: [
    {
      name: 'terms',
      type: 'textarea',
      defaultValue:
        '50% deposit on approval, balance net 30 on completion. Freight to/from Rosharon facility included within 150 miles. Quote excludes parts found damaged beyond inspection scope; change orders issued for approval before work proceeds.',
    },
    { name: 'taxRate', type: 'number', defaultValue: 8.25, admin: { description: 'Default tax rate (%). Editable per quote.' } },
    { name: 'validDays', type: 'number', defaultValue: 30, admin: { description: 'Default number of days a quote stays valid.' } },
    {
      name: 'footerLines',
      type: 'array',
      admin: { description: 'Footer strip lines on the quote document.' },
      defaultValue: [
        { text: 'centrifuge.com' },
        { text: 'quotes@centrifuge.com' },
        { text: 'Rosharon TX · Franklin Park IL · Alsip IL' },
      ],
      fields: [{ name: 'text', type: 'text', required: true }],
    },
  ],
}

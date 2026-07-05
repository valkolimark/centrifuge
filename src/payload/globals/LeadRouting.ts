import type { GlobalConfig } from 'payload'
import { anyAuthenticated, superAdminOnly } from '../access/roles'
import routing from '../../../data/routing.json'

// LeadRouting (UI-2 §2.3) — the single config source for the four notification
// recipients. Every form submission is emailed to ALL enabled recipients via Twilio.
// Defaults seed from data/routing.json; office staff can toggle a recipient, but the
// admin UI warns that the locked business rule is "all four".
export const LeadRouting: GlobalConfig = {
  slug: 'lead-routing',
  label: 'Lead Routing',
  admin: {
    group: 'Leads',
    description:
      'Recipients for every form-submission alert (Twilio batch send). Business rule: all four. Never hardcode addresses in code — this is the source of truth.',
  },
  access: { read: anyAuthenticated, update: superAdminOnly },
  fields: [
    {
      name: 'recipients',
      type: 'array',
      minRows: 1,
      defaultValue: routing.recipients,
      admin: { description: 'All enabled recipients receive every lead. Disabling one violates the "all four" rule — a warning is shown at send time.' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'role', type: 'text' },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}

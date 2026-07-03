import type { CollectionConfig } from 'payload'
import { anyAuthenticated, superAdminOnly } from '../access/roles'

// Form submissions (task 1.2 scaffolding; the forms engine writes here in Cycle 2).
// Read/export for all authenticated roles incl. viewer; created by the server action
// only (no admin create); immutable once stored.
export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: { singular: 'Form Submission', plural: 'Form Submissions' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['type', 'name', 'email', 'pageSource', 'createdAt'],
    group: 'Leads',
  },
  access: {
    read: anyAuthenticated, // incl. viewer — supports CSV export
    create: () => false, // written server-side via local API only
    update: () => false,
    delete: superAdminOnly,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Request a Quote', value: 'request_quote' },
        { label: 'Emergency Service', value: 'emergency_service' },
        { label: 'Free Inspection', value: 'free_inspection' },
        { label: 'Sell Your Centrifuge', value: 'sell_centrifuge' },
        { label: 'Contact', value: 'contact' },
        { label: 'Send Photos', value: 'send_photos' },
      ],
    },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'pageSource', type: 'text' },
    { name: 'utm', type: 'json', admin: { description: 'Captured UTM params.' } },
    { name: 'payload', type: 'json', admin: { description: 'Full submitted field set.' } },
  ],
}

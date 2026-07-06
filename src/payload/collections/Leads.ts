import type { CollectionConfig } from 'payload'
import { anyAuthenticated, superAdminOnly } from '../access/roles'
import { leadAfterChange } from '../hooks/leadRouting'

// leads (UI-2 §2.1) — the working lead record that powers the Leads & Quotes pipeline.
// Created by the native forms (server action, local API) and manually in the admin.
// On create, an afterChange hook (wired in the routing step) fires the Twilio batch
// send to all recipients + a submitter acknowledgement, writing results into `delivery`
// and `activity`. Versions enabled so stage/owner history is retained.
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'name',
    // Contact-oriented default columns (the sidebar "Contacts" entry lands here) — scroll,
    // search, and click any row to edit freely.
    defaultColumns: ['name', 'company', 'email', 'phone', 'pipelineStage', 'estimatedValue', 'createdAt'],
    group: 'Leads',
  },
  access: {
    read: anyAuthenticated,
    create: anyAuthenticated, // forms create via local API (overrideAccess); staff create manual leads
    update: anyAuthenticated, // pipeline drag-drop, owner, stage
    delete: superAdminOnly,
  },
  versions: true,
  // On create: batch-route to all recipients via Twilio + acknowledge submitter (UI-2 §3).
  hooks: { afterChange: [leadAfterChange] },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      name: 'sourceForm',
      type: 'select',
      defaultValue: 'contact',
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Quote Request', value: 'quote-request' },
        { label: 'Emergency', value: 'emergency' },
        { label: 'Phone-in', value: 'phone-in' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    { name: 'message', type: 'textarea', admin: { description: 'Raw submission body.' } },
    {
      name: 'payload',
      type: 'json',
      admin: { description: 'Full original form payload — immutable.', readOnly: true },
      access: { update: () => false }, // immutable once written
    },
    {
      name: 'pipelineStage',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar', description: 'Pipeline board column.' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoting', value: 'quoting' },
        { label: 'Quote Sent', value: 'quote-sent' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    { name: 'estimatedValue', type: 'number', admin: { position: 'sidebar', description: 'Estimated deal value (USD).' } },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Assigned owner. Suggestion only (Ron for quotes, David for emergency) — never auto-assigned.' },
    },
    {
      name: 'twilioOperationId',
      type: 'text',
      admin: { readOnly: true, description: 'Twilio Email Operation id for the routing batch send.' },
    },
    {
      name: 'delivery',
      type: 'array',
      admin: { readOnly: true, description: 'Per-recipient delivery status, polled from the Twilio Operation resource.' },
      fields: [
        { name: 'recipient', type: 'email', required: true },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'queued',
          options: [
            { label: 'Queued', value: 'queued' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Failed', value: 'failed' },
            { label: 'Bounced (recovered)', value: 'bounced-recovered' },
          ],
        },
        { name: 'timestamp', type: 'date' },
      ],
    },
    {
      name: 'activity',
      type: 'array',
      admin: { readOnly: true, description: 'Auto-appended: stage changes, sends, acknowledgements.' },
      fields: [
        { name: 'type', type: 'text' },
        { name: 'note', type: 'text' },
        { name: 'at', type: 'date' },
        { name: 'by', type: 'text' },
      ],
    },
  ],
}

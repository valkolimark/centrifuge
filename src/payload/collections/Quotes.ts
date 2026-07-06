import type { CollectionConfig } from 'payload'
import crypto from 'crypto'
import { anyAuthenticated, superAdminOnly } from '../access/roles'

// quotes (UI-2 §2.2) — the quote record + permanent archive of what was sent.
// Business rules enforced here:
//  · quoteNumber CW-Q-{YYYY}-{NNNN} auto-generated, unique (see generateQuoteNumber).
//  · issuingLocation locked to Rosharon (default + validation).
//  · sentSnapshots are append-only and immutable — what a client received is retained
//    forever even if the draft is later edited or the quote is "deleted" (retention).
//  · subtotal/tax/total are computed (virtual), never stored as editable fields.

const money = (items: { qty?: number; unitPrice?: number }[] = []) =>
  items.reduce((sum, li) => sum + (Number(li.qty) || 0) * (Number(li.unitPrice) || 0), 0)

// Generate the next CW-Q-{year}-{NNNN}. Queries the latest number for the year and
// increments; the unique index is the real guard — concurrent creates that collide
// are retried by the create helper (see lib/quotes/create.ts). 4-digit zero pad.
async function generateQuoteNumber(req: any): Promise<string> {
  const year = new Date().getUTCFullYear()
  const prefix = `CW-Q-${year}-`
  const res = await req.payload.find({
    collection: 'quotes',
    where: { quoteNumber: { like: prefix } },
    sort: '-quoteNumber',
    limit: 1,
    depth: 0,
    req,
  })
  const last = res.docs[0]?.quoteNumber as string | undefined
  const n = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0
  return `${prefix}${String(n + 1).padStart(4, '0')}`
}

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'Quote', plural: 'Quotes' },
  admin: {
    useAsTitle: 'quoteNumber',
    defaultColumns: ['quoteNumber', 'scopeTitle', 'status', 'total', 'createdAt'],
    group: 'Leads',
  },
  access: {
    read: anyAuthenticated, // hosted public page reads by viewToken via overrideAccess route
    create: anyAuthenticated,
    update: anyAuthenticated,
    delete: superAdminOnly,
  },
  versions: { drafts: true },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        if (operation === 'create') {
          if (!data.quoteNumber) data.quoteNumber = await generateQuoteNumber(req)
          if (!data.viewToken) data.viewToken = crypto.randomBytes(18).toString('base64url')
          // Seed office-editable defaults from the QuoteDefaults global when omitted.
          try {
            const defaults: any = await req.payload.findGlobal({ slug: 'quote-defaults', req })
            if (data.taxRate == null) data.taxRate = defaults?.taxRate ?? 8.25
            if (data.validDays == null) data.validDays = defaults?.validDays ?? 30
            if (!data.terms) data.terms = defaults?.terms ?? ''
          } catch {
            /* global not seeded yet — fall through to field defaults */
          }
        }
        // Locked issuing location — reject anything but Rosharon.
        if (data.issuingLocation && data.issuingLocation !== 'rosharon') {
          throw new Error('All quotes issue from Rosharon, TX — issuingLocation is locked.')
        }
        data.issuingLocation = 'rosharon'
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        // Append-only snapshots: existing sent versions can never be edited or removed.
        if (operation === 'update' && originalDoc?.sentSnapshots?.length) {
          const prev = originalDoc.sentSnapshots
          const next = data.sentSnapshots ?? []
          if (next.length < prev.length) {
            throw new Error('Sent snapshots are immutable and cannot be deleted.')
          }
          for (let i = 0; i < prev.length; i++) {
            const a = JSON.stringify({ ...prev[i], id: undefined })
            const b = JSON.stringify({ ...(next[i] ?? {}), id: undefined })
            if (a !== b) throw new Error(`Sent snapshot v${prev[i].version} is immutable and cannot be modified.`)
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Retention: a quote that was ever sent is never hard-deleted.
        const doc: any = await req.payload.findByID({ collection: 'quotes', id, depth: 0, req })
        if (doc?.sentSnapshots?.length) {
          throw new Error('This quote has sent snapshots and is retained permanently — it cannot be deleted.')
        }
      },
    ],
  },
  fields: [
    { name: 'quoteNumber', type: 'text', unique: true, index: true, admin: { readOnly: true, description: 'Auto-generated CW-Q-{YYYY}-{NNNN}.' } },
    { name: 'referenceNumber', type: 'text', admin: { description: 'Client PO / reference number (optional) — shown on the quote alongside the quote number.' } },
    { name: 'lead', type: 'relationship', relationTo: 'leads', admin: { description: 'Linked lead (nullable for manual quotes).' } },
    {
      name: 'client',
      type: 'group',
      fields: [
        { name: 'contactName', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'issuingLocation',
      type: 'select',
      defaultValue: 'rosharon',
      admin: { readOnly: true, description: 'Locked — all quotes issue from Rosharon, TX. Address/phone render from nap.json.' },
      options: [{ label: 'Rosharon, TX', value: 'rosharon' }],
    },
    { name: 'scopeTitle', type: 'text' },
    { name: 'description', type: 'textarea', admin: { description: 'Longer description / summary of the work, shown under the scope on the quote.' } },
    {
      name: 'lineItems',
      type: 'array',
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'qty', type: 'number', defaultValue: 1 },
        { name: 'unitPrice', type: 'number', defaultValue: 0 },
      ],
    },
    { name: 'taxRate', type: 'number', defaultValue: 8.25, admin: { description: 'Tax rate (%). Seeded from Quote Defaults.' } },
    { name: 'validDays', type: 'number', defaultValue: 30 },
    { name: 'validUntil', type: 'date', admin: { readOnly: true, description: 'Computed on send from validDays.' } },
    { name: 'terms', type: 'textarea' },
    // Computed, never stored (virtual) — populated on read.
    {
      name: 'subtotal',
      type: 'number',
      virtual: true,
      admin: { readOnly: true },
      hooks: { afterRead: [({ data }) => money(data?.lineItems)] },
    },
    {
      name: 'total',
      type: 'number',
      virtual: true,
      admin: { readOnly: true },
      hooks: { afterRead: [({ data }) => { const s = money(data?.lineItems); return s + (s * (Number(data?.taxRate) || 0)) / 100 } ] },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'sentSnapshots',
      type: 'array',
      admin: { readOnly: true, description: 'Immutable record of every send. Append-only.' },
      fields: [
        { name: 'version', type: 'number' },
        { name: 'sentAt', type: 'date' },
        { name: 'pdf', type: 'upload', relationTo: 'media' },
        { name: 'docData', type: 'json', admin: { description: 'Exact QuoteView rendered to the client — renders the hosted page "as sent".' } },
        { name: 'htmlHash', type: 'text', admin: { description: 'SHA-256 of the rendered document.' } },
        { name: 'twilioOperationId', type: 'text' },
        {
          name: 'recipientStatus',
          type: 'array',
          fields: [
            { name: 'recipient', type: 'email' },
            { name: 'status', type: 'text' },
          ],
        },
      ],
    },
    { name: 'viewToken', type: 'text', unique: true, index: true, admin: { readOnly: true, description: 'Unguessable token for the hosted quote page.' } },
    {
      name: 'viewEvents',
      type: 'array',
      admin: { readOnly: true, description: 'Appended by the public /quote/[viewToken] route.' },
      fields: [
        { name: 'at', type: 'date' },
        { name: 'ip', type: 'text' },
        { name: 'userAgent', type: 'text' },
      ],
    },
    {
      name: 'decision',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'decidedAt', type: 'date' },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}

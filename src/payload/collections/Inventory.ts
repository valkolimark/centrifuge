import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'
import { contentAccess, contentVersions, publishableHooks } from './shared'

const MACHINE_TYPES = [
  { label: 'Decanter centrifuge', value: 'decanter' },
  { label: 'Basket centrifuge', value: 'basket' },
  { label: 'Disc-stack separator', value: 'disc-stack' },
  { label: 'Pusher centrifuge', value: 'pusher' },
  { label: 'Peeler centrifuge', value: 'peeler' },
  { label: 'Separator', value: 'separator' },
  { label: 'Other', value: 'other' },
]

const CONDITIONS = [
  { label: 'Reconditioned', value: 'reconditioned' },
  { label: 'Rebuilt', value: 'rebuilt' },
  { label: 'Used — as-is', value: 'used' },
  { label: 'For parts', value: 'for-parts' },
]

const AVAILABILITY = [
  { label: 'Available', value: 'available' },
  { label: 'Sale pending', value: 'sale-pending' },
  { label: 'Sold', value: 'sold' },
]

// Inventory of used centrifuges for sale. Client-managed via /admin. Rendered at
// /inventory/ (listing) and /inventory/[slug] (Product + Offer schema). Only
// published, non-sold items are shown on the public site.
export const Inventory: CollectionConfig = {
  slug: 'inventory',
  labels: { singular: 'Inventory Item', plural: 'Inventory' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'machineType', 'brand', 'availability', 'price', '_status'],
    group: 'Content',
  },
  access: contentAccess,
  versions: contentVersions,
  hooks: publishableHooks,
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "Sharples P-3000 Solid-Bowl Decanter Centrifuge".' } },
    slugField('title'),
    {
      type: 'row',
      fields: [
        { name: 'brand', type: 'text', admin: { description: 'OEM brand, e.g. Sharples (must match /data/oem-brands.json spelling).' } },
        { name: 'machineType', type: 'select', options: MACHINE_TYPES, required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'model', type: 'text' },
        { name: 'condition', type: 'select', options: CONDITIONS, defaultValue: 'reconditioned' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'availability', type: 'select', options: AVAILABILITY, defaultValue: 'available', admin: { description: 'Sold items are hidden from the public site.' } },
        { name: 'price', type: 'number', admin: { description: 'USD. Leave blank and check "Price on request" if not public.' } },
        { name: 'priceOnRequest', type: 'checkbox', defaultValue: false, label: 'Price on request' },
      ],
    },
    { name: 'shortDescription', type: 'textarea', admin: { description: '1–2 sentences shown on the listing card.' } },
    { name: 'description', type: 'textarea', admin: { description: 'Full description shown on the detail page.' } },
    {
      name: 'specs',
      type: 'array',
      labels: { singular: 'Spec', plural: 'Specs' },
      admin: { description: 'Bowl diameter, max RPM/G-force, material, drive, etc.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'images',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show first in listings.' } },
    seoField,
  ],
}

import type { CollectionConfig } from 'payload'
import { contentAccess } from './shared'

// Competitor SEO snapshots for the Mission Control radar (UI-1 Phase D). Populated
// by scripts/import-competitor-csv.ts (Ahrefs/Semrush export → snapshot). The
// dashboard reads the latest capturedAt. Seed data is clearly-labeled example data.
export const CompetitorSnapshots: CollectionConfig = {
  slug: 'competitor-snapshots',
  labels: { singular: 'Competitor Snapshot', plural: 'Competitor Radar' },
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'domain', 'visibility', 'capturedAt'], group: 'Admin' },
  access: contentAccess,
  fields: [
    { name: 'label', type: 'text', required: true, admin: { description: 'Display name, e.g. "Acme Centrifuge Co."' } },
    { name: 'domain', type: 'text', required: true },
    { name: 'capturedAt', type: 'date', required: true, admin: { description: 'When this snapshot was captured (from the export).' } },
    {
      type: 'row',
      fields: [
        { name: 'visibility', type: 'number', admin: { description: 'SEO visibility score 0–100.' } },
        { name: 'topKeywords', type: 'number', admin: { description: 'Count of top-10 ranking keywords.' } },
        { name: 'estTraffic', type: 'number', admin: { description: 'Estimated monthly organic traffic.' } },
        { name: 'delta', type: 'number', admin: { description: 'Visibility change vs. prior snapshot.' } },
      ],
    },
    { name: 'isExample', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Placeholder/demo data — replace via CSV import.' } },
    {
      name: 'keywords',
      type: 'array',
      labels: { singular: 'Keyword', plural: 'Keyword battleground' },
      fields: [
        { name: 'query', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'ourRank', type: 'number' },
            { name: 'theirBest', type: 'number' },
            { name: 'movement', type: 'number', admin: { description: 'Rank change (+ improved, − dropped).' } },
          ],
        },
      ],
    },
  ],
}

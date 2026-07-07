import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LeadForm } from '@/components/forms/LeadForm'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { buildMetadata } from '@/lib/seo'
import { getInventoryItem } from '@/lib/inventory'
import { machineContext } from '@/lib/inventory-machine'

// Legacy URL preserved for Google links (/cw-ez-quote-for-sales/). Native request-a-quote
// LeadForm (Turnstile + honeypot; writes into the leads pipeline) — replaced the Cognito embed.
export const metadata: Metadata = buildMetadata(
  {
    title: 'EZ Quote — Fast Centrifuge Quote | Centrifuge World',
    description:
      'Get a fast quote on industrial centrifuge repair, rebuilds, or parts. Fill out our EZ Quote form and a specialist will follow up.',
  },
  '/cw-ez-quote-for-sales/',
)

// Phase 3: `?machine={slug}` pre-populates the form from an inventory listing. An unknown slug
// degrades silently to the blank form.
export default async function EzQuotePage({ searchParams }: { searchParams: Promise<{ machine?: string }> }) {
  const { machine: machineSlug } = await searchParams
  const item = machineSlug ? await getInventoryItem(machineSlug) : null
  const ctx = item && item.availability !== 'sold' ? machineContext(item) : null
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'EZ Quote', url: '/cw-ez-quote-for-sales/' }]} />
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1>EZ Quote</h1>
          <p className="mt-3 text-steel-700">
            Tell us about your machine and what you need. A Centrifuge World specialist will review
            your request and follow up with a quote.
          </p>
          <div className="mt-8">
            <LeadForm type="request_quote" prefill={ctx?.prefill} machine={ctx?.snapshot} />
          </div>
        </div>
      </Section>
      <EmergencyCallout />
    </SiteShell>
  )
}

import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CognitoForm } from '@/components/forms/CognitoForm'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { buildMetadata } from '@/lib/seo'

// Legacy URL preserved for Google links (/cw-ez-quote-for-sales/). Hosts the
// original Cognito "EZ Quote" form so inbound links keep resolving after cutover.
export const metadata: Metadata = buildMetadata(
  {
    title: 'EZ Quote — Fast Centrifuge Quote | Centrifuge World',
    description:
      'Get a fast quote on industrial centrifuge repair, rebuilds, or parts. Fill out our EZ Quote form and a specialist will follow up.',
  },
  '/cw-ez-quote-for-sales/',
)

export default function EzQuotePage() {
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
            <CognitoForm dataKey="6-kP0CxQH0CwXlv_9oww1A" formId="14" />
          </div>
        </div>
      </Section>
      <EmergencyCallout />
    </SiteShell>
  )
}

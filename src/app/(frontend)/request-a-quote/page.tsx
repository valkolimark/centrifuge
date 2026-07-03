import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { LeadForm } from '@/components/forms/LeadForm'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  {
    title: 'Request a Centrifuge Repair Quote | Centrifuge World',
    description:
      'Send your machine details for an inspection-first quote on centrifuge repair, rebuilds, balancing, or parts. 45+ OEM brands serviced, 24/7 emergency response.',
  },
  '/request-a-quote/',
)

export default function RequestAQuotePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Request a Quote', url: '/request-a-quote/' }]} />
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1>Request a quote</h1>
          <div className="mt-5">
            <AnswerBox question="How do I get a centrifuge repair quote?">
              Send us your machine type, brand, and the issue you&apos;re seeing. A Centrifuge World
              specialist reviews your details and follows up with an inspection-first quote. For
              machines that are down now, use the 24/7 emergency line for the fastest response.
            </AnswerBox>
          </div>
          <div className="mt-8">
            <LeadForm type="request_quote" />
          </div>
        </div>
      </Section>
      <EmergencyCallout />
    </SiteShell>
  )
}

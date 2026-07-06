import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { LeadForm } from '@/components/forms/LeadForm'
import { LocationCard } from '@/components/blocks/LocationCard'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { buildMetadata } from '@/lib/seo'
import { locations } from '@/lib/site'

// Legacy contact URL preserved for Google links (/contact-cw/). Native contact LeadForm
// (Turnstile + honeypot; writes into the leads pipeline) — replaced the Cognito embed.
export const metadata: Metadata = buildMetadata(
  {
    title: 'Contact Centrifuge World | Repair, Rebuilds & 24/7 Service',
    description:
      'Contact Centrifuge World for industrial centrifuge repair, rebuilds, parts, and 24/7 emergency service. Three US facilities; 45+ OEM brands.',
  },
  '/contact-cw/',
)

export default function ContactCwPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Contact', url: '/contact-cw/' }]} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1>Contact us</h1>
            <p className="mt-3 text-steel-700">
              Send us a message and a Centrifuge World specialist will get back to you. For machines
              that are down now, use the 24/7 emergency line.
            </p>
            <div className="mt-8">
              <LeadForm type="contact" />
            </div>
          </div>
          <aside className="space-y-4">
            {locations.map((loc) => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </aside>
        </div>
      </Section>
      <EmergencyCallout />
    </SiteShell>
  )
}

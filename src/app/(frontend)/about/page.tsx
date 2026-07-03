import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { StatsRow } from '@/components/blocks/StatsRow'
import { CTABanner } from '@/components/blocks/CTABanner'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  { title: 'About Centrifuge World | Centrifuge Repair Since 1939', description: 'Centrifuge World is the largest US provider and rebuilder of industrial centrifuges — independent, serving 45+ OEM brands from three facilities since 1939.' },
  '/about/',
)

export default function AboutPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'About', url: '/about/' }]} />
      <Hero
        variant="interior"
        eyebrow="About us"
        title="Industrial centrifuge specialists since 1939"
        subtitle="The largest provider and rebuilder of industrial centrifuges in the US — independent, and built around getting your machines back to reliable production."
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-4 text-steel-700">
          <p>
            Centrifuge World repairs and rebuilds industrial centrifuges of every major type — decanter,
            basket, disc-stack, pusher, and peeler — across 45+ OEM brands. As an independent specialist,
            we service equipment from many manufacturers, so plants get one shop for their whole fleet.
          </p>
          <p>
            Our work is inspection-first: we find the real cause of a problem, repair or rebuild to OEM
            specification, dynamically balance the rotating assembly, and test-run every machine before it
            ships. When originals are unavailable, we machine and fabricate wear parts in-house.
          </p>
          <p>
            From three US facilities and with nationwide field service, we keep production running — backed
            by a 24/7 emergency line for when a machine goes down.
          </p>
        </div>
        <div className="mt-10">
          <StatsRow
            stats={[
              { value: '1939', label: 'Serving industry since' },
              { value: '3', label: 'US facilities' },
              { value: '45+', label: 'OEM brands serviced' },
              { value: '24/7', label: 'Emergency response' },
            ]}
          />
        </div>
      </Section>
      <EmergencyCallout />
      <CTABanner secondary={{ label: 'See our services', href: '/services/' }} />
    </SiteShell>
  )
}

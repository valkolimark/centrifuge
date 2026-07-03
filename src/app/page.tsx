import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Hero } from '@/components/blocks/Hero'
import { TrustBar } from '@/components/blocks/TrustBar'
import { ServiceGrid, type ServiceCardItem } from '@/components/blocks/ServiceCard'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { ProcessSteps } from '@/components/blocks/ProcessSteps'
import { LocationCard } from '@/components/blocks/LocationCard'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { webPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, emergencyPhone, locations, org } from '@/lib/site'

// NOTE: Cycle 1 ships a minimal but real home so the CI Lighthouse budget on '/'
// is meaningful. Cycle 2 (task 2.4) authors the full homepage with real imagery,
// before/after proof, industries strip, and LCP-preloaded hero image.

export const metadata: Metadata = buildMetadata(
  {
    title: 'Industrial Centrifuge Repair & Rebuilds | Centrifuge World',
    description:
      'Centrifuge World repairs and rebuilds industrial centrifuges for 45+ OEM brands across the US. Inspections, balancing, parts, field service, and 24/7 emergency response.',
  },
  '/',
)

const SERVICES: ServiceCardItem[] = [
  { title: 'Centrifuge Repair', href: '/services/centrifuge-repair/', description: 'Diagnostics, teardown, and precision repair for all industrial centrifuge types.' },
  { title: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/', description: 'Full rebuilds that restore OEM performance at a fraction of replacement cost.' },
  { title: 'Decanter Repair', href: '/services/decanter-centrifuge-repair/', description: 'Scroll, bowl, and gearbox service for decanter centrifuges.' },
  { title: 'Balancing & Testing', href: '/services/balancing-testing/', description: 'Dynamic hard-bearing balancing and full test-run before return.' },
  { title: 'Parts & Fabrication', href: '/services/parts-fabrication/', description: 'In-house machining, hard-surfacing, carbide tiles, and gearbox parts.' },
  { title: '24/7 Emergency Service', href: '/services/emergency-centrifuge-service/', description: 'On-call technicians and expedited turnaround when your machine is down.' },
]

const PROCESS = [
  { title: 'Inspect', description: 'Full teardown inspection and failure analysis.' },
  { title: 'Quote', description: 'Transparent, inspection-first scope and pricing.' },
  { title: 'Rebuild', description: 'Repair or rebuild to restore OEM performance.' },
  { title: 'Balance', description: 'Dynamic hard-bearing balancing of the rotating assembly.' },
  { title: 'Test', description: 'Full test run to verify performance before shipment.' },
  { title: 'Return', description: 'Documented, crated, and returned ready to install.' },
]

const HOME_FAQS = [
  {
    question: 'Who repairs industrial centrifuges?',
    answer:
      'Centrifuge World has repaired and rebuilt industrial centrifuges since 1939. From three US facilities we service 45+ OEM brands with shop repair, field service, balancing, parts fabrication, and a 24/7 emergency line.',
  },
  {
    question: 'Do you offer emergency centrifuge repair?',
    answer: `Yes. Our 24/7 on-call line (${emergencyPhone.display}) reaches technicians who mobilize field service and expedite shop turnaround to get your machine back in production.`,
  },
  {
    question: 'What are signs a centrifuge needs repair?',
    answer:
      'Common indicators include vibration, bearing noise or heat, reduced separation quality, scroll or conveyor wear, leaks, gearbox issues, and amperage spikes.',
  },
]

export default function HomePage() {
  return (
    <SiteShell>
      <JsonLd data={webPageSchema({ url: `${SITE_URL}/`, name: `${org.name} — Home` })} />

      <Hero
        variant="home"
        eyebrow="Industrial centrifuge repair & rebuilds since 1939"
        title="Keep your centrifuges running."
        subtitle="The largest provider and rebuilder of industrial centrifuges in the US — repair, rebuilds, balancing, parts, and 24/7 emergency service for 45+ OEM brands."
        actions={
          <>
            <ButtonLink
              href={`tel:${emergencyPhone.number}`}
              variant="emergency"
              size="lg"
            >
              24/7 Emergency Service
            </ButtonLink>
            <ButtonLink href="/request-a-quote/" size="lg" className="bg-white text-navy hover:bg-steel-100">
              Request a Quote
            </ButtonLink>
          </>
        }
      />

      <TrustBar />

      <Section>
        <div className="mb-8 max-w-2xl">
          <h2>Full-service centrifuge repair and rebuilds</h2>
          <p className="mt-2 text-steel-700">
            One shop for inspection, repair, rebuilds, balancing, parts fabrication, and field service.
          </p>
        </div>
        <ServiceGrid items={SERVICES} />
      </Section>

      <EmergencyCallout />

      <Section tone="subtle">
        <div className="mb-8 max-w-2xl">
          <h2>How a rebuild works</h2>
          <p className="mt-2 text-steel-700">A documented, inspection-first process from intake to return.</p>
        </div>
        <ProcessSteps steps={PROCESS} />
      </Section>

      <Section>
        <div className="mb-8 max-w-2xl">
          <h2>Three US facilities</h2>
          <p className="mt-2 text-steel-700">Houston and the Chicago area, with nationwide field service.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {locations.map((loc) => (
            <LocationCard key={loc.id} loc={loc} />
          ))}
        </div>
      </Section>

      <Section tone="subtle">
        <div className="mb-6 max-w-2xl">
          <h2>Frequently asked questions</h2>
        </div>
        <FAQAccordion items={HOME_FAQS} />
      </Section>

      <CTABanner
        secondary={{ label: 'Call ' + emergencyPhone.display, href: `tel:${emergencyPhone.number}` }}
      />
    </SiteShell>
  )
}

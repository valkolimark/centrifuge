import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { TrackedButtonLink } from '@/components/ui/TrackedButtonLink'
import { Hero } from '@/components/blocks/Hero'
import { TrustBar } from '@/components/blocks/TrustBar'
import { ServiceGrid, type ServiceCardItem } from '@/components/blocks/ServiceCard'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { ProcessSteps } from '@/components/blocks/ProcessSteps'
import { BeforeAfterSlider } from '@/components/blocks/BeforeAfterSlider'
import { Gallery } from '@/components/blocks/Gallery'
import { LocationCard } from '@/components/blocks/LocationCard'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { webPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, emergencyPhone, locations, org } from '@/lib/site'
import { photos } from '@/lib/media'
import { INDUSTRIES } from '@/lib/stubs'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  {
    title: 'Industrial Centrifuge Repair & Rebuilds | Centrifuge World',
    description:
      'The largest US provider and rebuilder of industrial centrifuges. Repair, rebuilds, balancing, parts, gearbox work, field service, and 24/7 emergency for 45+ OEM brands. Since 1939.',
  },
  '/',
)

const QUOTE_HREF = '/cw-ez-quote-for-sales/'

const SERVICES: ServiceCardItem[] = [
  { title: 'Centrifuge Repair', href: '/services/centrifuge-repair/', description: 'Diagnostics, teardown, and precision repair for all industrial centrifuge types.' },
  { title: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/', description: 'Full rebuilds that restore OEM performance at a fraction of replacement cost.' },
  { title: 'Decanter Repair', href: '/services/decanter-centrifuge-repair/', description: 'Bowls, scroll conveyors, gearboxes, and bearings restored and balanced.' },
  { title: 'Balancing & Testing', href: '/services/balancing-testing/', description: 'Dynamic hard-bearing balancing and full test-run before return.' },
  { title: 'Parts & Fabrication', href: '/services/parts-fabrication/', description: 'In-house machining, hard-surfacing, carbide tiles, and gearbox parts.' },
  { title: '24/7 Emergency Service', href: '/services/emergency-centrifuge-service/', description: 'On-call technicians and expedited turnaround when your machine is down.' },
]

const TYPES = [
  { label: 'Decanter', href: '/services/decanter-centrifuge-repair/' },
  { label: 'Basket', href: '/services/basket-centrifuge-repair/' },
  { label: 'Disc Stack', href: '/services/disc-stack-centrifuge-repair/' },
  { label: 'Pusher & Peeler', href: '/services/pusher-peeler-centrifuge-repair/' },
  { label: 'Gearbox', href: '/services/gearbox-repair/' },
]

const PROCESS = [
  { title: 'Inspect', description: 'Full teardown inspection and failure analysis.' },
  { title: 'Quote', description: 'Transparent, inspection-first scope and pricing.' },
  { title: 'Rebuild', description: 'Repair or rebuild to restore OEM performance.' },
  { title: 'Balance', description: 'Dynamic hard-bearing balancing of the rotating assembly.' },
  { title: 'Test', description: 'Full test run to verify performance before shipment.' },
  { title: 'Return', description: 'Documented, crated, and returned ready to install.' },
]

const WHY = [
  { title: 'Serving industry since 1939', body: 'Decades of centrifuge repair and rebuild experience across every major machine type.' },
  { title: 'Independent — every brand', body: 'We service 45+ OEM brands, not a single manufacturer, so you get one shop for your whole fleet.' },
  { title: 'In-house machining', body: 'We fabricate wear parts and hard-surfacing ourselves, so long OEM lead times don’t keep you down.' },
  { title: 'Balanced & test-run', body: 'Every rotating assembly is dynamically balanced and verified before it ships.' },
  { title: '24/7 emergency response', body: 'On-call technicians and expedited shop turnaround when production is stopped.' },
  { title: 'Nationwide field service', body: 'On-site inspection, repair, vibration analysis, and installation support across the US.' },
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
  {
    question: 'Do you work on brands other than the original manufacturer?',
    answer:
      'Yes. Centrifuge World is an independent repair and rebuild specialist servicing 45+ OEM brands, including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and Flottweg.',
  },
  {
    question: 'How much can a rebuild save versus a new machine?',
    answer:
      'A quality rebuild typically costs a fraction of replacement. Exact savings depend on machine size and condition; we quote after an inspection.',
  },
]

interface TrustItem { value: string; label: string }
async function getTrustBar(): Promise<TrustItem[] | undefined> {
  try {
    const payload = await getPayloadClient()
    const settings = (await payload.findGlobal({ slug: 'site-settings' })) as { trustBar?: TrustItem[] }
    return settings.trustBar?.length ? settings.trustBar : undefined
  } catch {
    return undefined
  }
}

function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-pill border border-steel-300 bg-white px-4 py-2 text-sm font-medium text-navy hover:border-blue hover:text-blue"
    >
      {label}
    </Link>
  )
}

export default async function HomePage() {
  const trustBar = await getTrustBar()

  return (
    <SiteShell>
      <JsonLd data={webPageSchema({ url: `${SITE_URL}/`, name: `${org.name} — Home` })} />

      <Hero
        variant="home"
        eyebrow="Industrial centrifuge repair & rebuilds since 1939"
        title="Keep your centrifuges running."
        subtitle="The largest provider and rebuilder of industrial centrifuges in the US — repair, rebuilds, balancing, parts, and 24/7 emergency service for 45+ OEM brands."
        image={{ ...photos.shopHero, priority: true }}
        actions={
          <>
            <TrackedButtonLink
              href={`tel:${emergencyPhone.number}`}
              variant="emergency"
              size="lg"
              ctaLabel="Hero — 24/7 Emergency"
              ctaLocation="home_hero"
              phoneRole="emergency"
              phoneNumber={emergencyPhone.number}
            >
              24/7 Emergency Service
            </TrackedButtonLink>
            <TrackedButtonLink href={QUOTE_HREF} variant="on-dark" size="lg" ctaLabel="Hero — Request a Quote" ctaLocation="home_hero">
              Request a Quote
            </TrackedButtonLink>
          </>
        }
      />

      <TrustBar items={trustBar} />

      <Section>
        <div className="mb-8 max-w-2xl">
          <h2>Full-service centrifuge repair and rebuilds</h2>
          <p className="mt-2 text-steel-700">
            One shop for inspection, repair, rebuilds, balancing, parts fabrication, and field service.
          </p>
        </div>
        <ServiceGrid items={SERVICES} />
        <div className="mt-6">
          <Link href="/services/" className="font-semibold text-link hover:text-navy">
            View all services →
          </Link>
        </div>
      </Section>

      <EmergencyCallout />

      <Section tone="subtle">
        <div className="mb-6 max-w-2xl">
          <h2>Centrifuge types we service</h2>
          <p className="mt-2 text-steel-700">From high-speed separators to heavy decanters — and the gearboxes that drive them.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {TYPES.map((t) => (
            <Chip key={t.href} {...t} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-6 max-w-2xl">
          <h2>Industries we serve</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {INDUSTRIES.map((i) => (
            <Chip key={i.slug} label={i.label} href={i.href} />
          ))}
        </div>
      </Section>

      <Section tone="subtle">
        <div className="mb-8 max-w-2xl">
          <h2>How a rebuild works</h2>
          <p className="mt-2 text-steel-700">A documented, inspection-first process from intake to return.</p>
        </div>
        <ProcessSteps steps={PROCESS} />
      </Section>

      <Section>
        <div className="mb-8 max-w-2xl">
          <h2>Rebuilt, not replaced</h2>
          <p className="mt-2 text-steel-700">
            Real work from our shop — the same decanter centrifuge, worn and then fully rebuilt.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <BeforeAfterSlider before={photos.before} after={photos.after} />
          <Gallery images={photos.gallery} />
        </div>
      </Section>

      <Section tone="navy">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-white">Why Centrifuge World</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-card bg-white/5 p-5 ring-1 ring-white/10">
              <h3 className="text-white">{w.title}</h3>
              <p className="mt-2 text-sm text-white/85">{w.body}</p>
            </div>
          ))}
        </div>
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
        primary={{ label: 'Request a Quote', href: QUOTE_HREF }}
        secondary={{ label: 'Call ' + emergencyPhone.display, href: `tel:${emergencyPhone.number}` }}
      />
    </SiteShell>
  )
}

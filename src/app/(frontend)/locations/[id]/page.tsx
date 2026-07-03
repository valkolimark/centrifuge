import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { LocationCard } from '@/components/blocks/LocationCard'
import { MapFacade } from '@/components/blocks/MapFacade'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { JsonLd } from '@/components/JsonLd'
import { localBusinessSchema, breadcrumbSchema, faqPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, locations, type Location } from '@/lib/site'

export const revalidate = 3600

// Display name + metro + hero per facility. Houston uses the "Houston (Rosharon), TX"
// pattern (marketed as Houston; physical address is Rosharon).
const META: Record<string, { display: string; metro: string; hero: string }> = {
  houston: { display: 'Houston (Rosharon), TX', metro: 'Houston', hero: '2021/11/07192816/decanter-centrifuge-repair-hero-scaled.jpg' },
  'franklin-park': { display: 'Chicago – Franklin Park, IL', metro: 'Chicago', hero: '2019/10/07193552/centrifuge-repair-1024x771-2.jpg' },
  alsip: { display: 'Alsip, IL', metro: 'Chicago', hero: '2020/02/07193227/large-decanter.jpg' },
}
const S3 = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads'

export function generateStaticParams() {
  return locations.map((l) => ({ id: l.id }))
}

function getLoc(id: string): Location | undefined {
  return locations.find((l) => l.id === id)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const loc = getLoc(id)
  if (!loc) return { title: 'Not found', robots: { index: false } }
  const m = META[id]
  return buildMetadata(
    { title: `Centrifuge Repair in ${m?.metro || loc.addressLocality} | Centrifuge World`, description: `Industrial centrifuge repair, rebuilds, and 24/7 service at our ${m?.display || loc.label} facility. 45+ OEM brands, nationwide field service.` },
    `/locations/${id}/`,
  )
}

const CAPABILITIES = [
  'Centrifuge repair & rebuilds',
  'Dynamic balancing & test-run',
  'Parts fabrication & hard-surfacing',
  'Gearbox repair',
  'Field service dispatch',
  '24/7 emergency response',
]

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const loc = getLoc(id)
  if (!loc) notFound()
  const m = META[id]
  const display = m?.display || loc.label
  const metro = m?.metro || loc.addressLocality
  const url = `${SITE_URL}/locations/${id}/`
  const mapQuery = `${loc.streetAddress}, ${loc.addressLocality}, ${loc.addressRegion} ${loc.postalCode}`

  const faqs = [
    { question: `Who repairs industrial centrifuges near ${metro}?`, answer: `Centrifuge World's ${display} facility repairs and rebuilds industrial centrifuges for 45+ OEM brands, with balancing, parts fabrication, field service, and 24/7 emergency response.` },
    { question: 'Do you offer field service from this location?', answer: 'Yes — we dispatch field technicians for on-site inspection, repair, vibration analysis, and installation support, and provide nationwide coverage.' },
  ]

  const schema = [
    localBusinessSchema(loc, url),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Locations', url: `${SITE_URL}/locations/` },
      { name: display, url },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Locations', url: '/locations/' }, { name: display, url: `/locations/${id}/` }]} />

      <Hero
        variant="interior"
        eyebrow="Our facilities"
        title={`Centrifuge repair — ${display}`}
        subtitle={`Repair, rebuilds, balancing, parts, and 24/7 emergency service serving the ${metro} area and surrounding states.`}
        image={m ? { src: `${S3}/${m.hero}`, alt: `Centrifuge World ${display} facility`, width: 1600, height: 900 } : undefined}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={`Who repairs industrial centrifuges near ${metro}?`}>
            {faqs[0].answer}
          </AnswerBox>

          <div className="mt-8">
            <h2>Shop capabilities</h2>
            {/* TODO(verify: exact per-facility capability list with client) */}
            <p className="mt-1 text-sm text-steel-500">
              Our facilities support the full range of centrifuge services below.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <li key={c} className="flex gap-2 text-steel-700">
                  <span className="text-blue" aria-hidden="true">
                    →
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="max-w-sm">
            <LocationCard loc={loc} />
          </div>
          <MapFacade query={mapQuery} label={display} />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2>FAQs</h2>
          <div className="mt-5">
            <FAQAccordion items={faqs} emitSchema={false} />
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <RelatedLinks
          groups={[
            { heading: 'Services', links: [{ label: 'Centrifuge Repair', href: '/services/centrifuge-repair/' }, { label: 'Field Service', href: '/services/field-service/' }, { label: 'Emergency Service', href: '/services/emergency-centrifuge-service/' }] },
            { heading: 'Other locations', links: locations.filter((l) => l.id !== id).map((l) => ({ label: META[l.id]?.display || l.label, href: `/locations/${l.id}/` })) },
          ]}
        />
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2>Request a quote</h2>
          <div className="mt-6">
            <QuoteForm />
          </div>
        </div>
      </Section>

      <CTABanner secondary={{ label: 'Contact us', href: '/contact-cw/' }} />
    </SiteShell>
  )
}

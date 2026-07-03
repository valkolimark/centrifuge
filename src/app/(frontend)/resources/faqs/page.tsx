import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, emergencyPhone } from '@/lib/site'

export const metadata: Metadata = buildMetadata(
  { title: 'Centrifuge Repair FAQs | Centrifuge World', description: 'Answers to common questions about industrial centrifuge repair, rebuilds, emergency service, parts fabrication, and buying or selling used centrifuges.' },
  '/resources/faqs/',
)

// Categorized FAQ hub (faq-bank global questions). Unverified cost/turnaround
// numbers stay generic until client sign-off. FAQPage schema covers exactly the
// questions rendered here.
const CATEGORIES: { heading: string; items: { question: string; answer: string }[] }[] = [
  {
    heading: 'Repair & Rebuilds',
    items: [
      { question: 'Who repairs industrial centrifuges?', answer: 'Centrifuge World has repaired and rebuilt industrial centrifuges since 1939. From three US facilities we service 45+ OEM brands with shop repair, field service, balancing, and parts fabrication.' },
      { question: 'What does a centrifuge rebuild include?', answer: 'A full rebuild covers teardown inspection, replacement or refurbishment of worn bowls, scrolls, bearings, and seals, hard-surfacing where needed, dynamic balancing, and a documented test-run.' },
      { question: 'Do you work on brands other than the original manufacturer?', answer: 'Yes. We are an independent repair and rebuild specialist and service equipment from many manufacturers, including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and Flottweg.' },
      { question: 'What are signs a centrifuge needs repair?', answer: 'Vibration, bearing noise or heat, reduced separation quality, scroll or conveyor wear, leaks, gearbox issues, and amperage spikes are common indicators.' },
      { question: 'Do you balance and test-run rotating assemblies?', answer: 'Yes — every bowl, scroll, or basket we rebuild is dynamically hard-bearing balanced and test-run to verify vibration and performance before it ships.' },
    ],
  },
  {
    heading: 'Emergency & Field Service',
    items: [
      { question: 'Do you offer emergency centrifuge repair?', answer: `Yes — 24/7 on-call service. Our emergency line (${emergencyPhone.display}) reaches technicians who mobilize field service and expedite shop turnaround to get your machine back in production.` },
      { question: 'Do you offer on-site field service?', answer: 'Yes — nationwide on-site inspection, repair, vibration analysis, and installation/commissioning support.' },
      { question: 'What should I have ready when I call about a down machine?', answer: 'Machine type, brand and model if known, and a short description of what happened — noises, vibration, leaks, or alarms.' },
    ],
  },
  {
    heading: 'Parts & Fabrication',
    items: [
      { question: 'Can you fabricate custom centrifuge parts?', answer: 'Yes — in-house machining and fabrication, including hard-surfacing and carbide tiles, scroll flights, wear components, and gearbox parts.' },
      { question: 'Can you make a part that is no longer available?', answer: 'Often yes — we reverse-engineer and fabricate wear parts when OEM parts are discontinued or on long lead times.' },
      { question: 'Do you repair centrifuge gearboxes?', answer: 'Yes — decanter back-drive, planetary, and Sumitomo gearboxes: gears, bearings, and seals replaced, and differential and torque restored.' },
    ],
  },
  {
    heading: 'Buying & Selling',
    items: [
      { question: 'Do you buy and sell used centrifuges?', answer: 'Yes — sell your machine through our Sell Your Centrifuge page, and buy rebuilt or used machines through our inventory site.' },
      { question: 'Do you offer rental or loaner centrifuges?', answer: 'Ask our team about rental and loaner options to bridge a planned rebuild or unexpected downtime; availability depends on machine type and timing.' },
    ],
  },
  {
    heading: 'Costs & Turnaround',
    items: [
      { question: 'How much does centrifuge repair cost?', answer: 'It depends on the machine type, size, and damage, so we quote after an inspection. As framing: new machines can run from roughly $50,000 to $1M+, and a quality rebuild typically costs a fraction of replacement.' },
      { question: 'Can you inspect a centrifuge before quoting?', answer: 'Yes — we work inspection-first. We tear down and inspect the machine to find the real cause before scoping the repair, so the quote reflects the actual work.' },
    ],
  },
]

export default function FaqHubPage() {
  const allQuestions = CATEGORIES.flatMap((c) => c.items)
  const schema = [
    faqPageSchema(allQuestions),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'FAQs', url: `${SITE_URL}/resources/faqs/` },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'FAQs', url: '/resources/faqs/' }]} />
      <Section>
        <div className="max-w-2xl">
          <h1>Frequently asked questions</h1>
          <p className="mt-3 text-steel-700">Answers about centrifuge repair, rebuilds, emergency service, parts, and buying or selling machines.</p>
        </div>
        <div className="mt-8 space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.heading}>
              <h2 className="mb-4">{cat.heading}</h2>
              <FAQAccordion items={cat.items} emitSchema={false} />
            </div>
          ))}
        </div>
      </Section>
      <CTABanner primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }} secondary={{ label: 'Contact us', href: '/contact-cw/' }} />
    </SiteShell>
  )
}

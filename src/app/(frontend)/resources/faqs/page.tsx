import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { getFaqCategories } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  { title: 'Centrifuge Repair FAQs | Centrifuge World', description: 'Answers to common questions about industrial centrifuge repair, rebuilds, emergency service, parts fabrication, and buying or selling used centrifuges.' },
  '/resources/faqs/',
)

// Categorized FAQ hub. Content is now in the CMS (faqs collection) — editable in
// /admin — with a JSON fallback. FAQPage schema covers exactly what's rendered.
export default async function FaqHubPage() {
  const CATEGORIES = await getFaqCategories()
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

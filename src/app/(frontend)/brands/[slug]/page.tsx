import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { LeadForm } from '@/components/forms/LeadForm'
import { CTABanner } from '@/components/blocks/CTABanner'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { brands } from '@/lib/site'
import { brandStubBySlug } from '@/lib/stubs'
import { buildMetadata } from '@/lib/seo'

// Interim brand stub (Cycle 2). Full OEM library authored in Cycle 3 — noindexed
// until then, but 200 so service/industry cross-links resolve. Carries the
// independent-service disclosure and a brand-prefilled quote form.
export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brand = brandStubBySlug(slug)
  if (!brand) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    { title: `${brand.name} Centrifuge Repair | Centrifuge World`, description: `Independent repair and rebuilding of ${brand.name} centrifuges.`, noindex: true },
    `/brands/${brand.slug}/`,
  )
}

export default async function BrandStub({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = brandStubBySlug(slug)
  if (!brand) notFound()

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Brands', url: '/brands/' }, { name: brand.name, url: `/brands/${brand.slug}/` }]} />
      <Hero variant="interior" eyebrow="Brands we service" title={`${brand.name} centrifuge repair & rebuilds`} subtitle="Independent repair, rebuilds, balancing, and parts for your machine." />
      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={`Who repairs ${brand.name} centrifuges?`}>
            Centrifuge World repairs and rebuilds {brand.name} centrifuges. Since 1939 we have serviced
            45+ OEM brands with in-shop repair, field service, balancing, and parts fabrication, backed
            by a 24/7 emergency line.
          </AnswerBox>
          <p className="mt-6 rounded-card border-l-4 border-blue bg-steel-100 p-4 text-sm text-steel-700">
            Centrifuge World is an independent repair and rebuild specialist. We are not affiliated
            with {brand.name}.
          </p>
          <p className="mt-4 text-sm text-steel-500">
            A full {brand.name} page — models serviced, rebuild gallery, and brand FAQs — is being
            authored. Meanwhile, send your machine details below.
          </p>
          <div className="mt-8">
            <LeadForm type="request_quote" prefill={{ brand: brand.slug }} />
          </div>
        </div>
      </Section>
      <Section tone="subtle">
        <RelatedLinks
          groups={[
            { heading: 'Services', links: [{ label: 'Centrifuge Repair', href: '/services/centrifuge-repair/' }, { label: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/' }] },
            { heading: 'More brands', links: [{ label: 'All 45+ brands', href: '/brands/' }] },
          ]}
        />
      </Section>
      <CTABanner secondary={{ label: 'Call the 24/7 line', href: '/services/emergency-centrifuge-service/' }} />
    </SiteShell>
  )
}

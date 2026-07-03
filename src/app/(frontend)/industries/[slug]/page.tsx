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
import { INDUSTRIES, industryBySlug } from '@/lib/stubs'
import { buildMetadata } from '@/lib/seo'

// Interim industry stub (Cycle 2). Full pages authored in Cycle 4 — noindexed until
// then to avoid indexing thin content, but 200 so internal links resolve.
export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ind = industryBySlug(slug)
  if (!ind) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    { title: `Centrifuge Service for ${ind.label} | Centrifuge World`, description: `Centrifuge repair, rebuilds, and 24/7 service for ${ind.label.toLowerCase()} operations.`, noindex: true },
    `/industries/${ind.slug}/`,
  )
}

export default async function IndustryStub({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ind = industryBySlug(slug)
  if (!ind) notFound()

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: 'Industries', url: '/industries/' }, { name: ind.label, url: ind.href }]} />
      <Hero variant="interior" eyebrow="Industries" title={`Centrifuge service for ${ind.label.toLowerCase()}`} subtitle="Repair, rebuilds, balancing, parts, and 24/7 emergency response for your plant." />
      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={`Who services centrifuges for ${ind.label.toLowerCase()} plants?`}>
            Centrifuge World services the centrifuges that {ind.label.toLowerCase()} operations rely
            on — decanters, baskets, disc-stacks, and more — with repair, rebuilds, balancing, parts
            fabrication, field service, and a 24/7 emergency line, across 45+ OEM brands.
          </AnswerBox>
          <p className="mt-6 rounded-card border border-steel-300 bg-steel-100 p-4 text-sm text-steel-700">
            A full {ind.label} page — typical equipment, common failure modes, and industry-specific
            guidance — is being authored. In the meantime, tell us about your machine and we&apos;ll help.
          </p>
          <div className="mt-8">
            <LeadForm type="request_quote" prefill={{ location: ind.label }} />
          </div>
        </div>
      </Section>
      <Section tone="subtle">
        <RelatedLinks
          groups={[
            { heading: 'Services', links: [{ label: 'Centrifuge Repair', href: '/services/centrifuge-repair/' }, { label: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/' }, { label: 'Field Service', href: '/services/field-service/' }] },
            { heading: 'Brands we service', links: [{ label: 'Sharples', href: '/brands/sharples/' }, { label: 'Alfa Laval', href: '/brands/alfa-laval/' }] },
          ]}
        />
      </Section>
      <CTABanner secondary={{ label: 'Call the 24/7 line', href: '/services/emergency-centrifuge-service/' }} />
    </SiteShell>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { JsonLd } from '@/components/JsonLd'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { INDUSTRIES, industryBySlug } from '@/lib/stubs'
import { getIndustry } from '@/lib/content'

export const revalidate = 3600

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ind = industryBySlug(slug)
  const c = await getIndustry(slug)
  if (!ind) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    {
      title: c?.seoTitle || `Centrifuge Service for ${ind.label} | Centrifuge World`,
      description: c?.seoDescription || `Centrifuge repair, rebuilds, and 24/7 service for ${ind.label.toLowerCase()} operations.`,
      noindex: !c,
    },
    `/industries/${ind.slug}/`,
  )
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ind = industryBySlug(slug)
  if (!ind) notFound()
  const c = await getIndustry(slug)
  const name = c?.name || ind.label
  const url = `${SITE_URL}/industries/${slug}/`
  const faqs = (c?.faqs ?? []).filter((f) => f.question && f.answer)

  const answerBox =
    c?.answerBox ||
    `Centrifuge World services the centrifuges that ${name.toLowerCase()} operations rely on — with repair, rebuilds, balancing, parts fabrication, field service, and a 24/7 emergency line, across 45+ OEM brands.`

  const schema = [
    serviceSchema({ url, name: `Centrifuge service for ${name}`, serviceType: `Industrial centrifuge repair for ${name}`, description: answerBox }),
    faqs.length ? faqPageSchema(faqs) : null,
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Industries', url: `${SITE_URL}/industries/` },
      { name, url },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  const relatedGroups = [
    c?.relevantServices?.length ? { heading: 'Services', links: c.relevantServices } : null,
    c?.relatedBrands?.length ? { heading: 'Brands we service', links: c.relatedBrands } : null,
  ].filter(Boolean) as { heading: string; links: { label: string; href: string }[] }[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Industries', url: '/industries/' }, { name, url: `/industries/${slug}/` }]} />

      <Hero
        variant="interior"
        eyebrow="Industries"
        title={`Centrifuge service for ${name.toLowerCase()}`}
        subtitle={c?.intro || 'Repair, rebuilds, balancing, parts, and 24/7 emergency response for your plant.'}
        image={c?.hero ? { src: c.hero.src, alt: c.hero.alt, width: 1600, height: 900 } : undefined}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={`Who services centrifuges for ${name.toLowerCase()} plants?`}>{answerBox}</AnswerBox>

          {c?.typicalEquipment?.length ? (
            <div className="mt-8">
              <h2>Typical equipment in {name.toLowerCase()}</h2>
              <ul className="mt-4 space-y-3">
                {c.typicalEquipment.map((eq, i) => (
                  <li key={i} className="rounded-card border border-steel-300 bg-white p-4">
                    <p className="text-steel-700">{eq.text}</p>
                    {eq.links?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {eq.links.map((l) => (
                          <Link key={l.href} href={l.href} className="rounded-pill bg-steel-100 px-3 py-1 text-sm font-medium text-link hover:text-navy">
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {c?.failureModes?.length ? (
            <div className="mt-8">
              <h2>Common failure modes &amp; service needs</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {c.failureModes.map((f) => (
                  <li key={f} className="flex gap-2 text-steel-700">
                    <span className="text-blue" aria-hidden="true">
                      →
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {faqs.length ? (
        <Section tone="subtle">
          <div className="mx-auto max-w-3xl">
            <h2>{name} centrifuge FAQs</h2>
            <div className="mt-5">
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </Section>
      ) : null}

      {relatedGroups.length ? (
        <Section>
          <RelatedLinks groups={relatedGroups} />
        </Section>
      ) : null}

      <Section tone="subtle">
        <div className="mx-auto max-w-2xl">
          <h2>Get a quote for your {name.toLowerCase()} centrifuge</h2>
          <p className="mt-2 text-steel-700">Tell us about your machine and process.</p>
          <div className="mt-6">
            <QuoteForm />
          </div>
        </div>
      </Section>

      <CTABanner secondary={{ label: 'Call the 24/7 line', href: '/services/emergency-centrifuge-service/' }} />
    </SiteShell>
  )
}

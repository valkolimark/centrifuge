import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { ProcessSteps } from '@/components/blocks/ProcessSteps'
import { EmergencyCallout } from '@/components/blocks/EmergencyCallout'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { LeadForm } from '@/components/forms/LeadForm'
import { JsonLd } from '@/components/JsonLd'
import { getPayloadClient } from '@/lib/payload'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import {
  serviceSchema,
  faqPageSchema,
  breadcrumbSchema,
  type QA,
} from '@/lib/schema'
import type { FormType } from '@/lib/analytics'

// ISR: rebuilt on publish via the collection's revalidate hook.
export const revalidate = 3600
export const dynamicParams = true

interface LinkItem { label: string; href: string }
interface ServiceDoc {
  slug: string
  title: string
  h1?: string
  formType?: FormType
  answerBoxQuestion?: string
  answerBox?: string
  intro?: string
  capabilitiesHeading?: string
  capabilities?: { item: string; detail?: string }[]
  processHeading?: string
  process?: { title: string; description?: string }[]
  faqs?: QA[]
  relatedServices?: LinkItem[]
  relatedBrands?: LinkItem[]
  relatedIndustries?: LinkItem[]
  emergencyVariant?: boolean
  seo?: { title?: string; description?: string; noindex?: boolean; canonicalOverride?: string }
}

async function getService(slug: string): Promise<ServiceDoc | null> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })
    return (res.docs[0] as unknown as ServiceDoc) ?? null
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'services', limit: 100, depth: 0, where: { _status: { equals: 'published' } } })
    return res.docs.map((d) => ({ slug: (d as { slug: string }).slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return { title: 'Service not found', robots: { index: false } }
  return buildMetadata(
    {
      title: service.seo?.title || `${service.title} | Centrifuge World`,
      description: service.seo?.description || service.answerBox?.slice(0, 155),
      noindex: service.seo?.noindex,
      canonicalOverride: service.seo?.canonicalOverride,
    },
    `/services/${service.slug}/`,
  )
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const url = `${SITE_URL}/services/${service.slug}/`
  const h1 = service.h1 || service.title
  const faqs = (service.faqs ?? []).filter((f) => f.question && f.answer)
  const relatedGroups = [
    service.relatedServices?.length ? { heading: 'Related services', links: service.relatedServices } : null,
    service.relatedBrands?.length ? { heading: 'Brands we service', links: service.relatedBrands } : null,
    service.relatedIndustries?.length ? { heading: 'Industries', links: service.relatedIndustries } : null,
  ].filter(Boolean) as { heading: string; links: LinkItem[] }[]

  const schema = [
    serviceSchema({ url, name: service.title, serviceType: `${service.title} — industrial centrifuges`, description: service.answerBox }),
    faqs.length ? faqPageSchema(faqs) : null,
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Services', url: `${SITE_URL}/services/` },
      { name: service.title, url },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Services', url: '/services/' }, { name: service.title, url: `/services/${service.slug}/` }]} />

      <Hero
        variant={service.emergencyVariant ? 'emergency' : 'interior'}
        eyebrow="Centrifuge service"
        title={h1}
        subtitle={service.intro}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          {service.answerBox ? (
            <AnswerBox question={service.answerBoxQuestion || `About ${service.title}`}>
              {service.answerBox}
            </AnswerBox>
          ) : null}

          {service.capabilities?.length ? (
            <div className="mt-10">
              <h2>{service.capabilitiesHeading || 'What we do'}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.capabilities.map((c) => (
                  <li key={c.item} className="rounded-card border border-steel-300 bg-white p-4">
                    <p className="font-semibold text-navy">{c.item}</p>
                    {c.detail ? <p className="mt-1 text-sm text-steel-700">{c.detail}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {service.process?.length ? (
        <Section tone="subtle">
          <div className="mx-auto max-w-3xl">
            <h2>{service.processHeading || 'How it works'}</h2>
            <div className="mt-5">
              <ProcessSteps steps={service.process} />
            </div>
          </div>
        </Section>
      ) : null}

      <EmergencyCallout />

      {faqs.length ? (
        <Section>
          <div className="mx-auto max-w-3xl">
            <h2>Frequently asked questions</h2>
            <div className="mt-5">
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </Section>
      ) : null}

      {relatedGroups.length ? (
        <Section tone="subtle">
          <RelatedLinks groups={relatedGroups} />
        </Section>
      ) : null}

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2>Get a quote for {service.title.toLowerCase()}</h2>
          <p className="mt-2 text-steel-700">Send your machine details for an inspection-first quote.</p>
          <div className="mt-6">
            <LeadForm type={(service.formType as FormType) || 'request_quote'} prefill={{ serviceNeeded: service.title }} />
          </div>
        </div>
      </Section>

      <CTABanner secondary={{ label: 'Talk to a specialist', href: '/contact/' }} />
    </SiteShell>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { BeforeAfterSlider } from '@/components/blocks/BeforeAfterSlider'
import { Gallery } from '@/components/blocks/Gallery'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { getCaseStudies, getCaseStudy } from '@/lib/content'

export const revalidate = 3600

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCaseStudy(slug)
  if (!c) return { title: 'Not found', robots: { index: false } }
  return buildMetadata({ title: c.seoTitle || `${c.title} | Centrifuge World`, description: c.seoDescription }, `/resources/case-studies/${slug}/`)
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCaseStudy(slug)
  if (!c) notFound()
  const url = `${SITE_URL}/resources/case-studies/${slug}/`
  const gallery = (c.gallery ?? []).map((im) => ({ src: im.src, alt: im.alt, width: 800, height: 600 }))

  const schema = [
    articleSchema({ url, headline: c.title, description: c.seoDescription, image: c.hero?.src || 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2021/12/07192728/after.jpg', datePublished: '2026-07-01', dateModified: '2026-07-01' }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Case Studies', url: `${SITE_URL}/resources/case-studies/` },
      { name: c.title, url },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'Case Studies', url: '/resources/case-studies/' }, { name: c.title, url: `/resources/case-studies/${slug}/` }]} />

      <Hero variant="interior" eyebrow={c.clientIndustry || 'Case study'} title={c.title} image={c.hero ? { src: c.hero.src, alt: c.hero.alt, width: 1600, height: 900 } : undefined} />

      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-card border border-steel-300 bg-steel-100 p-4 text-sm text-steel-700">
            <p>This case study is published as a draft. Outcome and timeline details are pending client confirmation.</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {c.machineBrandModel ? (
              <div><dt className="text-sm text-steel-500">Machine</dt><dd className="font-semibold text-navy">{c.machineBrandModel}</dd></div>
            ) : null}
            {c.clientIndustry ? (
              <div><dt className="text-sm text-steel-500">Industry</dt><dd className="font-semibold text-navy">{c.clientIndustry}</dd></div>
            ) : null}
          </dl>

          {c.problem ? (
            <div><h2 className="text-xl">The problem</h2><p className="mt-2 text-steel-700">{c.problem}</p></div>
          ) : null}

          {c.scopeOfWork?.length ? (
            <div>
              <h2 className="text-xl">Scope of work</h2>
              <ul className="mt-2 grid gap-2">
                {c.scopeOfWork.map((s) => (
                  <li key={s} className="flex gap-2 text-steel-700"><span className="text-blue" aria-hidden="true">→</span>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {c.beforeAfter?.map((pair, i) => (
            <div key={i}>
              <h2 className="text-xl">Before &amp; after</h2>
              <div className="mt-3">
                <BeforeAfterSlider before={pair.before} after={pair.after} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {gallery.length ? (
        <Section tone="subtle">
          <div className="mb-6 max-w-2xl"><h2>Project gallery</h2></div>
          <Gallery images={gallery} />
        </Section>
      ) : null}

      {(c.relatedServices?.length || c.relatedBrands?.length) ? (
        <Section>
          <RelatedLinks
            groups={[
              ...(c.relatedServices?.length ? [{ heading: 'Services', links: c.relatedServices }] : []),
              ...(c.relatedBrands?.length ? [{ heading: 'Brands', links: c.relatedBrands }] : []),
            ]}
          />
        </Section>
      ) : null}

      <CTABanner primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }} secondary={{ label: 'Talk to a specialist', href: '/contact-cw/' }} />
    </SiteShell>
  )
}

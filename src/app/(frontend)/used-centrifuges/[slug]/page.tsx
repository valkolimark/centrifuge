import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { Gallery } from '@/components/blocks/Gallery'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { USED_CATEGORIES, getUsedCategory } from '@/content/used-centrifuges'

export const revalidate = 3600
const INVENTORY = 'https://inventory.centrifuge.com'

export function generateStaticParams() {
  return USED_CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getUsedCategory(slug)
  if (!c) return { title: 'Not found', robots: { index: false } }
  return buildMetadata({ title: c.seoTitle, description: c.seoDescription }, `/used-centrifuges/${slug}/`)
}

export default async function UsedCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getUsedCategory(slug)
  if (!c) notFound()
  const url = `${SITE_URL}/used-centrifuges/${slug}/`
  const gallery = c.gallery.map((im) => ({ src: im.src, alt: im.alt, width: 800, height: 600 }))

  const schema = [
    serviceSchema({ url, name: c.h1, serviceType: 'Used industrial centrifuge sales and purchasing', description: c.answerBox }),
    faqPageSchema(c.faqs),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Used Centrifuges', url: `${SITE_URL}/used-centrifuges/` },
      { name: c.h1, url },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Used Centrifuges', url: '/used-centrifuges/' }, { name: c.h1, url: `/used-centrifuges/${slug}/` }]} />

      <Hero
        variant="interior"
        eyebrow="Used centrifuges for sale"
        title={c.h1}
        subtitle={c.intro}
        image={{ src: c.hero.src, alt: c.hero.alt, width: 1600, height: 900 }}
        actions={
          <>
            <ButtonLink href={INVENTORY} external variant="on-dark">
              Browse inventory
            </ButtonLink>
            <ButtonLink href="/cw-ez-quote-for-sales/" variant="outline-dark">
              Request a Quote
            </ButtonLink>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={c.answerQuestion}>{c.answerBox}</AnswerBox>
          {c.sections.map((s) => (
            <div key={s.heading} className="mt-8">
              <h2 className="text-xl">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-steel-700">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {gallery.length ? (
        <Section tone="subtle">
          <div className="mb-6 max-w-2xl">
            <h2>Machines we recondition &amp; trade</h2>
          </div>
          <Gallery images={gallery} />
        </Section>
      ) : null}

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2>FAQs</h2>
          <div className="mt-5">
            <FAQAccordion items={c.faqs} />
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <RelatedLinks
          groups={[
            { heading: 'Brands we handle', links: c.brands },
            { heading: 'Applications', links: c.applications },
            { heading: 'More', links: [{ label: 'All used centrifuges', href: '/used-centrifuges/' }, { label: 'Sell your centrifuge', href: '/sell-your-centrifuge/' }] },
          ]}
        />
      </Section>

      <CTABanner
        heading={`Ready to buy or sell a ${c.h1.replace('Used ', '').replace(' for Sale', '').toLowerCase()}?`}
        body="Tell us your process for a reconditioned match, or send details of the machine you're selling."
        primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }}
        secondary={{ label: 'Browse inventory', href: INVENTORY }}
      />
    </SiteShell>
  )
}

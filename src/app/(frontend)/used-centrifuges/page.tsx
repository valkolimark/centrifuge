import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { USED_HUB } from '@/content/used-centrifuges'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata(
  { title: USED_HUB.seoTitle, description: USED_HUB.seoDescription },
  '/used-centrifuges/',
)

export default function UsedCentrifugesHub() {
  const url = `${SITE_URL}/used-centrifuges/`
  const schema = [
    serviceSchema({ url, name: 'Buy & sell used industrial centrifuges', serviceType: 'Used industrial centrifuge sales and purchasing', description: USED_HUB.answerBox }),
    faqPageSchema(USED_HUB.faqs),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Used Centrifuges', url },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Used Centrifuges', url: '/used-centrifuges/' }]} />

      <Hero
        variant="interior"
        eyebrow="Buy & sell used centrifuges"
        title={USED_HUB.h1}
        subtitle={USED_HUB.intro}
        image={{ src: USED_HUB.hero.src, alt: USED_HUB.hero.alt, width: 1600, height: 900 }}
        actions={
          <>
            <ButtonLink href={USED_HUB.inventoryUrl} variant="on-dark">
              Browse inventory
            </ButtonLink>
            <ButtonLink href="/sell-your-centrifuge/" variant="outline-dark">
              Sell your centrifuge
            </ButtonLink>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={USED_HUB.answerQuestion}>{USED_HUB.answerBox}</AnswerBox>

          <div className="mt-10">
            <h2>Used centrifuges by type</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {USED_HUB.types.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="flex h-full items-center justify-between rounded-card border border-steel-300 bg-white p-4 font-semibold text-navy hover:border-blue hover:text-blue">
                    {t.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: 'Buying a used centrifuge', blurb: 'Reconditioned, tested machines matched to your process.', steps: USED_HUB.buySteps, cta: { label: 'Browse inventory', href: '/inventory/' } },
            { title: 'Selling your centrifuge', blurb: 'A fair offer for machines you no longer run.', steps: USED_HUB.sellSteps, cta: { label: 'Sell your centrifuge', href: '/sell-your-centrifuge/' } },
          ].map((col) => (
            <div key={col.title} className="flex flex-col rounded-card border border-steel-300 bg-white p-6 sm:p-8">
              <h2 className="text-2xl">{col.title}</h2>
              <p className="mt-2 text-steel-700">{col.blurb}</p>
              <ol className="mt-6 space-y-5">
                {col.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-navy">{s.title}</p>
                      <p className="text-sm text-steel-700">{s.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-auto pt-6">
                <ButtonLink href={col.cta.href} variant="secondary">
                  {col.cta.label}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2>Buy &amp; sell used centrifuges — FAQs</h2>
          <div className="mt-5">
            <FAQAccordion items={USED_HUB.faqs} />
          </div>
        </div>
      </Section>

      <CTABanner
        heading="Looking for a specific machine?"
        body="Tell us your process and we'll match a reconditioned centrifuge — or make an offer on yours."
        primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }}
        secondary={{ label: 'Browse inventory', href: USED_HUB.inventoryUrl }}
      />
    </SiteShell>
  )
}

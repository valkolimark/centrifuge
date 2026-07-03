import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { VideoFacade } from '@/components/blocks/VideoFacade'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, faqPageSchema, breadcrumbSchema, videoObjectSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { getHowItWorks, getHowItWorksItem } from '@/lib/content'
import { toVideoSource, youtubeEmbedUrl } from '@/lib/videos'

export const revalidate = 3600

export function generateStaticParams() {
  return getHowItWorks().map((h) => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const h = getHowItWorksItem(slug)
  if (!h) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    { title: h.seoTitle || `${h.title} | Centrifuge World`, description: h.seoDescription },
    `/resources/how-it-works/${slug}/`,
  )
}

export default async function HowItWorksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const h = getHowItWorksItem(slug)
  if (!h) notFound()
  const url = `${SITE_URL}/resources/how-it-works/${slug}/`
  const faqs = (h.faqs ?? []).filter((f) => f.question && f.answer)

  const schema = [
    articleSchema({
      url,
      headline: h.title,
      description: h.seoDescription,
      image: 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2020/02/07193227/large-decanter.jpg',
      datePublished: '2026-07-01',
      dateModified: '2026-07-01',
    }),
    faqs.length ? faqPageSchema(faqs) : null,
    h.videoId
      ? videoObjectSchema({
          name: h.title,
          description: h.seoDescription || h.title,
          thumbnailUrl: `https://i.ytimg.com/vi/${h.videoId}/hqdefault.jpg`,
          embedUrl: youtubeEmbedUrl(h.videoId),
        })
      : null,
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'How Centrifuges Work', url: `${SITE_URL}/resources/how-it-works/` },
      { name: h.title, url },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'How Centrifuges Work', url: '/resources/how-it-works/' }, { name: h.title, url: `/resources/how-it-works/${slug}/` }]} />

      <Hero variant="interior" eyebrow="How centrifuges work" title={h.title} />

      <Section>
        <div className="mx-auto max-w-3xl">
          {h.answerBox ? <AnswerBox question={h.title}>{h.answerBox}</AnswerBox> : null}

          {h.videoId ? (
            <div className="mt-8">
              <VideoFacade video={toVideoSource({ id: h.videoId, title: h.title })} />
            </div>
          ) : null}

          {h.sections?.map((s) => (
            <div key={s.heading} className="mt-8">
              <h2 className="text-xl">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-steel-700">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}

          {h.signsNeedRepair?.length ? (
            <div className="mt-10 rounded-card border border-steel-300 bg-steel-100 p-5">
              <h2 className="text-xl">Signs this type needs repair</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {h.signsNeedRepair.map((s) => (
                  <li key={s} className="flex gap-2 text-steel-700">
                    <span className="text-safety" aria-hidden="true">
                      ⚠
                    </span>
                    {s}
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
            <h2>FAQs</h2>
            <div className="mt-5">
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <RelatedLinks
          groups={[
            ...(h.relatedService ? [{ heading: 'Related service', links: [h.relatedService] }] : []),
            ...(h.relatedBrands?.length ? [{ heading: 'Brands we service', links: h.relatedBrands }] : []),
          ]}
        />
      </Section>

      <CTABanner primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }} secondary={{ label: 'Talk to a specialist', href: '/contact-cw/' }} />
    </SiteShell>
  )
}

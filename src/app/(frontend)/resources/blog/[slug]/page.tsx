import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { CTABanner } from '@/components/blocks/CTABanner'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { getBlogPosts, getBlogPost } from '@/lib/content'

export const revalidate = 3600

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getBlogPost(slug)
  if (!p) return { title: 'Not found', robots: { index: false } }
  return buildMetadata({ title: p.seoTitle || `${p.title} | Centrifuge World`, description: p.seoDescription }, `/resources/blog/${slug}/`)
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getBlogPost(slug)
  if (!p) notFound()
  const url = `${SITE_URL}/resources/blog/${slug}/`
  const faqs = (p.faqs ?? []).filter((f) => f.question && f.answer)

  const schema = [
    articleSchema({ url, headline: p.title, description: p.seoDescription, image: p.hero?.src || 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2020/02/07193227/large-decanter.jpg', datePublished: p.publishedAt || '2026-07-01', dateModified: p.publishedAt || '2026-07-01' }),
    faqs.length ? faqPageSchema(faqs) : null,
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Blog', url: `${SITE_URL}/resources/blog/` },
      { name: p.title, url },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Resources', url: '/resources/' }, { name: 'Blog', url: '/resources/blog/' }, { name: p.title, url: `/resources/blog/${slug}/` }]} />

      <Hero variant="interior" eyebrow="Blog" title={p.title} subtitle={p.excerpt} image={p.hero ? { src: p.hero.src, alt: p.hero.alt, width: 1600, height: 900 } : undefined} />

      <Section>
        <article className="mx-auto max-w-3xl">
          {p.sections?.map((s) => (
            <div key={s.heading} className="mt-8 first:mt-0">
              <h2 className="text-xl">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-steel-700">
                {s.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}

          {p.internalLinks?.length ? (
            <div className="mt-10 rounded-card border border-steel-300 bg-steel-100 p-5">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-steel-500">Related pages</p>
              <ul className="flex flex-wrap gap-2">
                {p.internalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="rounded-pill bg-white px-3 py-1.5 text-sm font-medium text-link hover:text-navy">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
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

      <CTABanner primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }} secondary={{ label: 'Call the 24/7 line', href: '/services/emergency-centrifuge-service/' }} />
    </SiteShell>
  )
}

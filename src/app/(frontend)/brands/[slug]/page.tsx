import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Hero } from '@/components/blocks/Hero'
import { AnswerBox } from '@/components/blocks/AnswerBox'
import { Gallery } from '@/components/blocks/Gallery'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'
import { RelatedLinks } from '@/components/blocks/RelatedLinks'
import { CTABanner } from '@/components/blocks/CTABanner'
import { VideoFacade } from '@/components/blocks/VideoFacade'
import { InventoryCard } from '@/components/blocks/InventoryCard'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { getInventoryByBrand } from '@/lib/inventory'
import { JsonLd } from '@/components/JsonLd'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, brands } from '@/lib/site'
import { brandStubBySlug } from '@/lib/stubs'
import { getBrandContent } from '@/lib/content'
import { BRAND_VIDEO, fallbackBrandHero } from '@/lib/page-media'
import { toVideoSource } from '@/lib/videos'

export const revalidate = 3600
const INVENTORY = '/inventory/'

// Map a brand's serviced types to the matching "used centrifuges" category for
// long-tail "buy/sell used <brand>" internal linking.
function usedCategoryFor(types?: string[]): { label: string; href: string } {
  const t = (types ?? []).join(' ').toLowerCase()
  if (t.includes('decanter')) return { label: 'used decanter centrifuges', href: '/used-centrifuges/decanter-centrifuges/' }
  if (t.includes('basket')) return { label: 'used basket centrifuges', href: '/used-centrifuges/basket-centrifuges/' }
  if (t.includes('disc')) return { label: 'used disc-stack separators', href: '/used-centrifuges/disc-stack-separators/' }
  if (t.includes('pusher') || t.includes('peeler')) return { label: 'used pusher & peeler centrifuges', href: '/used-centrifuges/pusher-peeler-centrifuges/' }
  return { label: 'used centrifuges', href: '/used-centrifuges/' }
}

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await getBrandContent(slug)
  const brand = brandStubBySlug(slug)
  if (!brand) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    {
      title: c?.seoTitle || `${brand.name} Centrifuge Repair | Centrifuge World`,
      description: c?.seoDescription || `Independent repair and rebuilding of ${brand.name} centrifuges by Centrifuge World.`,
      // Publish (indexable) once we have real harvested content; stubs stay noindex.
      noindex: !c,
    },
    `/brands/${brand.slug}/`,
  )
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = brandStubBySlug(slug)
  if (!brand) notFound()
  const c = await getBrandContent(slug)
  // Merge decision (e.g. alfa-laval-sharples → alfa-laval): redirect to the target.
  if (c?.mergeInto) redirect(`/brands/${c.mergeInto}/`)
  const name = c?.name || brand.name
  const url = `${SITE_URL}/brands/${slug}/`
  const stock = await getInventoryByBrand(name)

  const answerBox =
    c?.answerBox ||
    `Centrifuge World repairs and rebuilds ${name} centrifuges. Since 1939 we have serviced 45+ OEM brands with in-shop repair, field service, balancing, and parts fabrication, backed by a 24/7 emergency line.`
  const disclosure =
    c?.disclosure ||
    `Centrifuge World is an independent repair and rebuild specialist. We are not affiliated with ${name}.`
  const usedCat = usedCategoryFor(c?.typesServiced)
  const buyFaq = {
    question: `Can I buy or sell a used ${name} centrifuge?`,
    answer: `Yes. Centrifuge World buys and sells used ${name} centrifuges. The machines we sell are inspected, reconditioned where needed, balanced, and test-run, and we buy ${name} machines of most conditions. Browse our inventory or request a quote to buy, or use our Sell Your Centrifuge page.`,
  }
  const faqs = [...(c?.faqs ?? []).filter((f) => f.question && f.answer), buyFaq]
  // Only S3-hosted images are loadable (allowed in next.config; the live domain is captcha-walled).
  const s3Images = (c?.images ?? []).filter((im) => im.src.includes('centrifuge-im.s3.amazonaws.com'))
  // Every brand gets a hero: its own harvested image, else a varied shop-image fallback.
  const hero = s3Images[0]
    ? { src: s3Images[0].src, alt: s3Images[0].alt, width: 1600, height: 900 }
    : { ...fallbackBrandHero(slug), alt: `${name} centrifuge repair at Centrifuge World` }
  const galleryImgs = s3Images.map((im) => ({ src: im.src, alt: im.alt, width: 800, height: 600 }))
  const videoId = BRAND_VIDEO[slug]

  const relatedGroups = [
    c?.relatedServices?.length
      ? { heading: 'Services', links: c.relatedServices }
      : { heading: 'Services', links: [{ label: 'Centrifuge Repair', href: '/services/centrifuge-repair/' }, { label: 'Centrifuge Rebuilds', href: '/services/centrifuge-rebuilds/' }] },
    c?.relatedBrands?.length
      ? { heading: 'Other brands', links: [...c.relatedBrands, { label: 'All 45+ brands', href: '/brands/' }] }
      : { heading: 'More brands', links: [{ label: 'All 45+ brands', href: '/brands/' }] },
    c?.relatedIndustries?.length ? { heading: 'Industries', links: c.relatedIndustries } : null,
  ].filter(Boolean) as { heading: string; links: { label: string; href: string }[] }[]

  const schema = [
    serviceSchema({ url, name: `${name} Centrifuge Repair`, serviceType: `${name} centrifuge repair and rebuilding`, description: answerBox }),
    faqs.length ? faqPageSchema(faqs) : null,
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Brands', url: `${SITE_URL}/brands/` },
      { name, url },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Brands', url: '/brands/' }, { name, url: `/brands/${slug}/` }]} />

      <Hero
        variant="interior"
        eyebrow="Brands we service"
        title={`${name} centrifuge repair & rebuilds`}
        subtitle={c?.intro || 'Independent repair, rebuilds, balancing, and parts for your machine.'}
        image={hero}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <AnswerBox question={`Who repairs ${name} centrifuges?`}>{answerBox}</AnswerBox>

          <p className="mt-6 rounded-card border-l-4 border-blue bg-steel-100 p-4 text-sm font-medium text-steel-700">
            {disclosure}
          </p>

          {c?.body?.length ? (
            <div className="mt-6 space-y-4 text-steel-700">
              {c.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-steel-500">
              A full {name} page — models serviced, rebuild gallery, and brand FAQs — is being authored.
            </p>
          )}

          {c?.modelsServiced?.length ? (
            <div className="mt-8">
              <h2 className="text-xl">{name} models serviced</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.modelsServiced.map((m) => (
                  <li key={m} className="rounded-button border border-steel-300 bg-white px-3 py-1.5 text-sm font-medium text-navy">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {c?.typesServiced?.length ? (
            <p className="mt-6 text-steel-700">
              <span className="font-semibold text-navy">Centrifuge types serviced:</span>{' '}
              {c.typesServiced.join(', ')}.
            </p>
          ) : null}
        </div>
      </Section>

      <Section tone="subtle">
        <div className="mx-auto max-w-3xl">
          <h2>Buy or sell a used {name} centrifuge</h2>
          <p className="mt-3 text-steel-700">
            Need a reconditioned {name} centrifuge, or want to sell one you no longer run? Centrifuge
            World buys and sells used {name} machines — the ones we sell are inspected, rebuilt where
            needed, balanced, and test-run before they ship. Browse our{' '}
            <Link href={usedCat.href} className="text-link underline">
              {usedCat.label}
            </Link>{' '}
            or the full inventory.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={INVENTORY}>
              Browse inventory
            </ButtonLink>
            <ButtonLink href="/cw-ez-quote-for-sales/" variant="secondary">
              Request a Quote
            </ButtonLink>
            <ButtonLink href="/sell-your-centrifuge/" variant="ghost">
              Sell your {name} centrifuge
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2>
            {name} machines in stock{stock.total ? ` (${stock.total})` : ''}
          </h2>
          <Link href={INVENTORY} className="whitespace-nowrap text-sm font-semibold text-link">
            Browse all machines →
          </Link>
        </div>
        {stock.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stock.items.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-steel-700">
            No {name} machines in stock right now —{' '}
            <Link href={INVENTORY} className="text-link underline">
              browse all inventory
            </Link>{' '}
            or{' '}
            <Link href="/cw-ez-quote-for-sales/" className="text-link underline">
              request a quote
            </Link>{' '}
            and we&apos;ll source one.
          </p>
        )}
      </Section>

      {videoId ? (
        <Section tone={undefined}>
          <div className="mx-auto max-w-3xl">
            <h2>{name} repair in the shop</h2>
            <div className="mt-5">
              <VideoFacade video={toVideoSource({ id: videoId, title: `${name} centrifuge repair` })} />
            </div>
          </div>
        </Section>
      ) : null}

      {galleryImgs.length ? (
        <Section tone={videoId ? 'subtle' : 'default'}>
          <div className="mb-6 max-w-2xl">
            <h2>{name} rebuild gallery</h2>
          </div>
          <Gallery images={galleryImgs} />
        </Section>
      ) : null}

      {faqs.length ? (
        <Section>
          <div className="mx-auto max-w-3xl">
            <h2>{name} centrifuge repair FAQs</h2>
            <div className="mt-5">
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </Section>
      ) : null}

      <Section tone="subtle">
        <RelatedLinks groups={relatedGroups} />
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2>Get a quote for {name} centrifuge service</h2>
          <p className="mt-2 text-steel-700">Send your machine details and our team will follow up.</p>
          <div className="mt-6">
            <QuoteForm />
          </div>
        </div>
      </Section>

      <CTABanner secondary={{ label: 'Call the 24/7 line', href: '/services/emergency-centrifuge-service/' }} />
    </SiteShell>
  )
}

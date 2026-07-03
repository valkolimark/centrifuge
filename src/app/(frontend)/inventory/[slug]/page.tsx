import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Gallery } from '@/components/blocks/Gallery'
import { CTABanner } from '@/components/blocks/CTABanner'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, org } from '@/lib/site'
import { getInventory, getInventoryItem, MACHINE_TYPE_LABELS, CONDITION_LABELS, type InventoryItem } from '@/lib/inventory'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getInventory()).map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await getInventoryItem(slug)
  if (!item) return { title: 'Not found', robots: { index: false } }
  return buildMetadata(
    {
      title: item.seoTitle || `${item.title} for Sale | Centrifuge World`,
      description: item.seoDescription || item.shortDescription || `${item.title} — reconditioned used centrifuge for sale from Centrifuge World.`,
    },
    `/inventory/${slug}/`,
  )
}

const CONDITION_SCHEMA: Record<string, string> = {
  reconditioned: 'https://schema.org/RefurbishedCondition',
  rebuilt: 'https://schema.org/RefurbishedCondition',
  used: 'https://schema.org/UsedCondition',
  'for-parts': 'https://schema.org/UsedCondition',
}

function priceLabel(item: InventoryItem): string {
  if (item.price && !item.priceOnRequest) return `$${item.price.toLocaleString('en-US')}`
  return 'Price on request'
}

function productSchema(item: InventoryItem, url: string): Record<string, unknown> {
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url,
    availability: item.availability === 'sale-pending' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
    itemCondition: CONDITION_SCHEMA[item.condition ?? 'used'] ?? 'https://schema.org/UsedCondition',
    seller: { '@type': 'Organization', name: org.name, url: `${SITE_URL}/` },
  }
  // Only publish a price when one is actually set (never fabricate).
  if (item.price && !item.priceOnRequest) {
    offer.price = item.price
    offer.priceCurrency = 'USD'
  }
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description || item.shortDescription || item.title,
    category: `${MACHINE_TYPE_LABELS[item.machineType] ?? 'Centrifuge'} centrifuge`,
    offers: offer,
  }
  if (item.images.length) schema.image = item.images.map((i) => i.url)
  if (item.brand) schema.brand = { '@type': 'Brand', name: item.brand }
  if (item.model) schema.model = item.model
  return schema
}

export default async function InventoryItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getInventoryItem(slug)
  if (!item || item.availability === 'sold') notFound()
  const url = `${SITE_URL}/inventory/${slug}/`
  const gallery = item.images.map((im) => ({ src: im.url, alt: im.alt, width: im.width ?? 1200, height: im.height ?? 900 }))
  const typeLabel = MACHINE_TYPE_LABELS[item.machineType] ?? 'Centrifuge'

  const schema = [
    productSchema(item, url),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Inventory', url: `${SITE_URL}/inventory/` },
      { name: item.title, url },
    ]),
  ] as Record<string, unknown>[]

  return (
    <SiteShell>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ name: 'Inventory', url: '/inventory/' }, { name: item.title, url: `/inventory/${slug}/` }]} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {gallery.length ? (
              <Gallery images={gallery} />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-steel-300 bg-steel-100 text-steel-500">
                Photos available on request
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{typeLabel}</span>
              {item.condition ? <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{CONDITION_LABELS[item.condition] ?? item.condition}</span> : null}
              {item.availability === 'sale-pending' ? <span className="rounded-button bg-navy px-2 py-0.5 text-white">Sale pending</span> : null}
            </div>

            <h1 className="mt-3">{item.title}</h1>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {item.brand ? (<><dt className="text-steel-500">Brand</dt><dd className="text-navy">{item.brand}</dd></>) : null}
              {item.model ? (<><dt className="text-steel-500">Model</dt><dd className="text-navy">{item.model}</dd></>) : null}
            </dl>
            <p className="mt-4 text-2xl font-bold text-navy">{priceLabel(item)}</p>

            {item.description ? <p className="mt-4 text-steel-700">{item.description}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="#request">Request this machine</ButtonLink>
              <ButtonLink href="/used-centrifuges/" variant="secondary">
                More {typeLabel.toLowerCase()} machines
              </ButtonLink>
            </div>

            {item.specs.length ? (
              <div className="mt-8">
                <h2 className="text-lg">Specifications</h2>
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {item.specs.map((s) => (
                      <tr key={s.label} className="border-b border-steel-300">
                        <th scope="row" className="py-2 pr-4 text-left font-medium text-steel-700">{s.label}</th>
                        <td className="py-2 text-navy">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <div id="request" className="mx-auto max-w-2xl scroll-mt-24">
          <h2>Request this {typeLabel.toLowerCase()} centrifuge</h2>
          <p className="mt-2 text-steel-700">Send your details and our team will confirm availability, price, and lead time.</p>
          <div className="mt-6">
            <QuoteForm />
          </div>
          <p className="mt-4 text-sm text-steel-500">
            Prefer to talk? <Link href="/contact-cw/" className="text-link underline">Contact us</Link> or call the numbers in the header.
          </p>
        </div>
      </Section>

      <CTABanner
        heading="Not quite the machine you need?"
        body="Tell us your process and we'll match another reconditioned centrifuge — or make an offer on yours."
        primary={{ label: 'Request a Quote', href: '/cw-ez-quote-for-sales/' }}
        secondary={{ label: 'Browse all inventory', href: '/inventory/' }}
      />
    </SiteShell>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { InventoryGallery } from '@/components/blocks/InventoryGallery'
import { CTABanner } from '@/components/blocks/CTABanner'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL, org, brands } from '@/lib/site'
import { getInventory, getInventoryItem, MACHINE_TYPE_LABELS, CONDITION_LABELS, type InventoryItem } from '@/lib/inventory'
import { machineContext } from '@/lib/inventory-machine'

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
      description: item.seoDescription || item.shortDescription || `${item.title} — used centrifuge for sale from Centrifuge World.`,
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
  // Phase 3: pre-populate the embedded quote form from this machine.
  const { snapshot: machineSnapshot, prefill: machinePrefill } = machineContext(item)
  const typeLabel = MACHINE_TYPE_LABELS[item.machineType] ?? 'Centrifuge'
  const brandSlug = item.brand ? brands.find((b) => b.name.toLowerCase() === item.brand!.toLowerCase())?.slug : undefined
  const inStock = item.availability !== 'sale-pending'

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
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: gallery */}
          <div className="lg:col-span-5">
            <InventoryGallery images={item.images} />
          </div>

          {/* Middle: details */}
          <div className="lg:col-span-4">
            <h1 className="text-2xl leading-tight sm:text-3xl">{item.title}</h1>
            {item.brand ? (
              brandSlug ? (
                <Link href={`/brands/${brandSlug}/`} className="mt-1 inline-block text-sm font-medium text-link hover:underline">
                  Visit the {item.brand} page
                </Link>
              ) : (
                <span className="mt-1 inline-block text-sm text-steel-500">{item.brand}</span>
              )
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{typeLabel}</span>
              {item.condition ? <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">{CONDITION_LABELS[item.condition] ?? item.condition}</span> : null}
              {item.model ? <span className="rounded-button bg-steel-100 px-2 py-0.5 text-steel-700">Model {item.model}</span> : null}
            </div>

            <hr className="my-5 border-steel-300" />

            {item.shortDescription ? <p className="font-medium text-navy">{item.shortDescription}</p> : null}

            {item.specs.length ? (
              <div className="mt-4">
                <h2 className="text-base font-semibold text-navy">Specifications</h2>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {item.specs.map((s) => (
                      <tr key={s.label} className="border-b border-steel-300/70">
                        <th scope="row" className="w-1/2 py-1.5 pr-4 text-left font-medium text-steel-700">{s.label}</th>
                        <td className="py-1.5 text-navy">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {item.description ? (
              <div className="mt-4">
                <h2 className="text-base font-semibold text-navy">About this machine</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-steel-700">{item.description}</p>
              </div>
            ) : null}
          </div>

          {/* Right: buy box */}
          <div className="lg:col-span-3">
            <div className="rounded-card border border-steel-300 bg-white p-5 lg:sticky lg:top-24">
              <p className="text-2xl font-bold text-navy">{priceLabel(item)}</p>
              {item.priceOnRequest || !item.price ? (
                <p className="mt-1 text-xs text-steel-500">We quote after confirming spec, condition &amp; lead time.</p>
              ) : null}

              <p className={`mt-4 text-lg font-semibold ${inStock ? 'text-[color:var(--color-success)]' : 'text-navy'}`}>
                {inStock ? 'In stock' : 'Sale pending'}
              </p>

              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-500">Sold by</dt>
                  <dd className="text-right font-medium text-navy">{org.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-500">Condition</dt>
                  <dd className="text-right text-navy">{item.condition ? CONDITION_LABELS[item.condition] ?? item.condition : 'Used'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-500">Prep</dt>
                  <dd className="text-right text-navy">Inspected &amp; test-run</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-col gap-2">
                <ButtonLink href="#request" className="w-full justify-center">
                  Request this machine
                </ButtonLink>
                <ButtonLink href="/contact-cw/" variant="secondary" className="w-full justify-center">
                  Contact us
                </ButtonLink>
              </div>

              <p className="mt-4 border-t border-steel-300 pt-3 text-xs text-steel-500">
                Nationwide shipping and field commissioning available. Have one to sell?{' '}
                <Link href="/sell-your-centrifuge/" className="text-link underline">
                  Sell your centrifuge
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <div id="request" className="mx-auto max-w-2xl scroll-mt-24">
          <h2>Request this {typeLabel.toLowerCase()} centrifuge</h2>
          <p className="mt-2 text-steel-700">Send your details and our team will confirm availability, price, and lead time.</p>
          <div className="mt-6">
            <QuoteForm prefill={machinePrefill} machine={machineSnapshot} />
          </div>
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
